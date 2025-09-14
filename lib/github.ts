import { App, Octokit } from "octokit";

export const githubApp = new App({
  appId: process.env.GITHUB_APP_ID!,
  privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
})

export const getInstallationForUser = async (username: string) => {
  const installations = await githubApp.octokit.request(`GET /app/installations?username=${username}`);
  return installations.data;
}

export const getInstallationOctokit = async (installationId: number) => {
  const installationOctokit = await githubApp.getInstallationOctokit(installationId);
  return installationOctokit;
}

export const getRepoFiles = async (octokit: Octokit, owner: string, repo: string, branch = "main") => {
  const { data: refData } = await octokit.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${branch}`,
  });

  const commitSha = refData.object.sha;

  // Get the tree recursively
  const { data: treeData } = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: commitSha,
    recursive: "true",
  });

  // Filter only blobs (files)
  const files = treeData.tree.filter((item) => item.type === "blob");

  // Fetch content for each file
  const contents = await Promise.all(
    files.map(async (file) => {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: file.path,
      });
      if (!("content" in data)) {
        return { path: file.path, content: "" };
      }

      return {
        path: file.path,
        content: Buffer.from(data.content, "base64").toString("utf-8"),
      };
    })
  );

  return contents;
}
