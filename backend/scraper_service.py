import requests
from bs4 import BeautifulSoup

def fetch_text_from_url(url: str) -> str:
    """
    Fetches the HTML content of a URL and extracts readable text 
    (title, headings, paragraphs) for scam analysis.
    Raises Exception if the URL is unreachable or blocks the request.
    """
    try:
        # Use a generic browser User-Agent so we don't get blocked by basic WAFs
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        response = requests.get(url, headers=headers, timeout=10, verify=False)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Kill all script and style elements
        for script in soup(["script", "style"]):
            script.extract()
            
        # Get text
        text = soup.get_text(separator=' ')
        
        # Break into lines and remove leading and trailing space on each
        lines = (line.strip() for line in text.splitlines())
        # Break multi-headlines into a line each
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        # Drop blank lines
        text = '\n'.join(chunk for chunk in chunks if chunk)
        
        # Truncate to a reasonable length so we don't blow up the LLM context window
        return text[:5000]
        
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to fetch URL. Ensure it is correct and publicly accessible. Error: {str(e)}")
