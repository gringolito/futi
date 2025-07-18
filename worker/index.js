export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/list")) {
      // List files and folders in R2
      const prefix = url.searchParams.get("path") || "";
      const list = await env.BUCKET.list({ prefix, delimiter: "/" });
      const folders = (list.delimitedPrefixes || []).map((p) => ({
        type: "folder",
        name: p.replace(prefix, "").replace(/\/$/, ""),
        key: p,
      }));
      const files = (list.objects || [])
        .filter((obj) => /\.(jpe?g|png)$/i.test(obj.key))
        .map((obj) => ({
          type: "file",
          name: obj.key.replace(prefix, ""),
          key: obj.key,
        }));
      return Response.json({ items: [...folders, ...files] });
    }

    if (url.pathname.startsWith("/api/image")) {
      const key = url.searchParams.get("key");
      if (!key) return new Response("Missing key", { status: 400 });
      const obj = await env.BUCKET.get(key);
      if (!obj) return new Response("Not found", { status: 404 });
      const contentType = key.endsWith(".png") ? "image/png" : "image/jpeg";
      return new Response(obj.body, {
        headers: { "content-type": contentType },
      });
    }

    return new Response(null, { status: 404 });
  },
};
