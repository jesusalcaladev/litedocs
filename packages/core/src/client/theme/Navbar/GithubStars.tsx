import { useEffect, useState } from "react";
import { GitHub } from "../icons/github";
import { getStarsRepo } from "../../utils";

export function GithubStars({ repo }: { repo: string }) {
  const [stars, setStars] = useState<string | null>(null);

  useEffect(() => {
    if (repo) {
      getStarsRepo(repo)
        .then((stars) => setStars(stars))
        .catch(() => setStars("0"));
    }
  }, [repo]);

  return (
    <a
      href={`https://github.com/${repo}`}
      target="_blank"
      rel="noopener noreferrer"
      className="navbar-github-stars"
    >
      <GitHub />
      {stars && <span>{stars}</span>}
    </a>
  );
}
