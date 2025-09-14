
export async function POST(request: Request) {
  const { owner, repo, head, base, prompt, new_branch } = await request.json();
  const response = await fetch("http://localhost:9000/2015-03-31/functions/function/invocations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      owner,
      repo,
      head,
      base,
      prompt,
      new_branch
    }),
  });
  const data = await response.json();
  return new Response(JSON.stringify(data), {
    status: data.status
  })
}
