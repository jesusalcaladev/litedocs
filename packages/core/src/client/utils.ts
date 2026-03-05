/**
 * Get the number of stars for a GitHub repository.
 * @param repo - The repository name in the format "owner/repo".
 * @returns The number of stars for the repository.
 */
export async function getStarsRepo(repo: string) {
  const response = await fetch(`https://api.github.com/repos/${repo}`);
  const data = await response.json();
  if (data.stargazers_count !== undefined) {
    return formatStars(data.stargazers_count);
  } else {
    return "0"; // Fallback
  }
}

/**
 * Format a number of stars in a compact form.
 * @param count - The number of stars to format.
 * @returns The formatted number of stars.
 */
const formatStars = (count: number): string => {
  return Intl.NumberFormat("en", {
    notation: "compact",
    compactDisplay: "short",
  }).format(count);
};
