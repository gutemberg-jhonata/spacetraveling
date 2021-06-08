import { useEffect, useRef } from "react"

export function Comments() {
  const commentsRef = useRef<HTMLDivElement>();

  useEffect(() => {
    const script = document.createElement("script");

    script.setAttribute("src", "https://utteranc.es/client.js");
    script.setAttribute("repo", "gutemberg-jhonata/ig.news-comments");
    script.setAttribute("issue-term", "pathname");
    script.setAttribute("theme", "github-dark");
    script.setAttribute("crossorigin", "anonymous");
    script.setAttribute("async", "true");

    commentsRef.current.appendChild(script);
  }, []);

  return (
    <div ref={commentsRef} />
  );
}