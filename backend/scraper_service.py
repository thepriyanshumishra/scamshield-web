"""
scraper_service.py — ScamShield URL content extractor.

Strategy:
  1. Strip all noise tags (scripts, styles, nav, footer, cookie banners).
  2. Prefer semantic content regions (<main>, <article>, role="main").
  3. Fall back to full <body> if no semantic region is found.
  4. Detect correct encoding so Hindi/regional text isn't garbled.
  5. Return up to 10 000 chars — enough for Groq to analyse a full phishing page.
"""

import re

import requests
from bs4 import BeautifulSoup

# Tags that are almost never part of the real page content
_NOISE_TAGS = [
    "script", "style", "noscript",
    "nav", "header", "footer", "aside",
    "form", "button", "input", "select",
    "iframe", "figure", "figcaption",
    "svg", "img",
]

# Max characters sent to the LLM
_MAX_CHARS = 10_000


def fetch_text_from_url(url: str) -> str:
    """
    Scrape readable text from a public URL for scam analysis.

    Returns a cleaned, plain-text string (up to _MAX_CHARS characters).
    Raises Exception with a human-readable message on failure.
    """
    # ── 1. Fetch ────────────────────────────────────────────────────────────
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-IN,en;q=0.9,hi;q=0.8",
    }
    try:
        resp = requests.get(
            url, headers=headers,
            timeout=12,
            verify=False,
            allow_redirects=True,
        )
    except requests.exceptions.ConnectionError:
        raise Exception(
            "Could not connect to that URL. Check if the site is online and publicly accessible."
        )
    except requests.exceptions.Timeout:
        raise Exception(
            "The URL took too long to respond (>12 s). Try a faster / more accessible link."
        )
    except requests.exceptions.RequestException as e:
        raise Exception(f"Network error while fetching URL: {e}")

    if resp.status_code == 403:
        raise Exception(
            "The website blocked our request (HTTP 403). "
            "Some sites (Cloudflare-protected) cannot be scraped. "
            "Try pasting the message text directly instead."
        )
    if resp.status_code == 429:
        raise Exception("The website is rate-limiting scrapers. Try again in a few seconds.")
    if resp.status_code >= 400:
        raise Exception(f"The URL returned HTTP {resp.status_code}. It may be broken or private.")

    # ── 2. Decode correctly ─────────────────────────────────────────────────
    # requests often defaults to latin-1; apparent_encoding uses chardet.
    encoding = resp.apparent_encoding or "utf-8"
    try:
        html = resp.content.decode(encoding, errors="replace")
    except Exception:
        html = resp.text  # fallback

    # ── 3. Parse HTML ────────────────────────────────────────────────────────
    soup = BeautifulSoup(html, "html.parser")

    # Keep a raw copy BEFORE stripping — used as SPA fallback below
    soup_raw = BeautifulSoup(html, "html.parser")
    for tag in soup_raw(["script", "style", "noscript"]):
        tag.decompose()

    # Strip noise tags from primary parse
    for tag in soup(_NOISE_TAGS):
        tag.decompose()

    # Remove cookie / GDPR banners by common class/id patterns (primary parse only)
    for tag in soup.find_all(True, class_=re.compile(r"cookie|banner|popup|modal|overlay|consent", re.I)):
        tag.decompose()
    for tag in soup.find_all(True, id=re.compile(r"cookie|banner|popup|modal|overlay|consent", re.I)):
        tag.decompose()

    # ── 4. Prefer semantic content regions ──────────────────────────────────
    content_node = (
        soup.find("main")
        or soup.find(attrs={"role": "main"})
        or soup.find("article")
        or soup.find(id=re.compile(r"content|main|body|article", re.I))
        or soup.find("body")
        or soup
    )

    raw_text = content_node.get_text(separator="\n")

    # ── 5. Clean whitespace ─────────────────────────────────────────────────
    lines = [ln.strip() for ln in raw_text.splitlines()]
    # Collapse consecutive blank lines → single blank line
    cleaned_lines: list[str] = []
    prev_blank = False
    for ln in lines:
        if not ln:
            if not prev_blank:
                cleaned_lines.append("")
            prev_blank = True
        else:
            cleaned_lines.append(ln)
            prev_blank = False

    text = "\n".join(cleaned_lines).strip()

    # ── 6. SPA Fallback ──────────────────────────────────────────────────────
    # JavaScript-heavy SPAs (React/Angular) have little static text in their
    # HTML shell after stripping noise. If we got almost nothing, fall back to
    # the raw full-body text (scripts already removed, but nav/footer kept).
    # This gives Groq at least the page title, meta descriptions, and any
    # server-side-rendered strings, which is usually enough for analysis.
    if len(text) < 100:
        raw_body = soup_raw.find("body") or soup_raw
        fallback_lines = [ln.strip() for ln in raw_body.get_text(separator="\n").splitlines()]
        fallback_text = "\n".join(ln for ln in fallback_lines if ln).strip()

        if fallback_text and len(fallback_text) >= 100:
            note = "[Note: This page uses JavaScript rendering — only static content could be extracted.]\n\n"
            return (note + fallback_text)[:_MAX_CHARS]

        # ── 7. Meta/Title last resort (pure SPAs with empty <body>) ─────────
        # Pull title + all meta tags. Even a blank React div usually has rich
        # <head> meta tags with page title, description, og:description etc.
        meta_parts: list[str] = []

        title_tag = soup_raw.find("title")
        if title_tag and title_tag.get_text(strip=True):
            meta_parts.append(f"Page Title: {title_tag.get_text(strip=True)}")

        for meta in soup_raw.find_all("meta"):
            name    = meta.get("name", "") or meta.get("property", "")
            content = meta.get("content", "")
            if name and content:
                meta_parts.append(f"{name}: {content}")

        if meta_parts:
            note = (
                "[Note: This page is a JavaScript-only SPA. "
                "The following metadata was extracted from the page <head> for analysis.]\n\n"
            )
            return (note + "\n".join(meta_parts))[:_MAX_CHARS]

        # Truly unscrapable — nothing found anywhere
        raise Exception(
            "No readable text was found at this URL. "
            "The page appears to be a JavaScript-only SPA or is entirely image-based. "
            "Try pasting the message text you received directly instead."
        )

    return text[:_MAX_CHARS]


