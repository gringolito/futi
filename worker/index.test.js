import { describe, it, expect, vi } from "vitest";

// Mock env and fetch for Worker
const mockEnv = {
  BUCKET: {
    list: vi.fn(async ({ prefix, delimiter }) => ({
      delimitedPrefixes: prefix === "" ? ["photos/"] : [],
      objects:
        prefix === ""
          ? [{ key: "cat.jpg" }, { key: "dog.png" }, { key: "notes.txt" }]
          : [{ key: "photos/sunset.jpg" }, { key: "photos/beach.png" }],
    })),
    get: vi.fn(async (key) => {
      if (key === "cat.jpg") return { body: new Uint8Array([1, 2, 3]) };
      return null;
    }),
  },
};

const worker = await import("../worker/index.js");

describe("Worker API", () => {
  it("/api/list returns folders and image files", async () => {
    const req = new Request("http://localhost/api/list?path=");
    const res = await worker.default.fetch(req, mockEnv);
    const data = await res.json();
    expect(data.items).toEqual([
      { type: "folder", name: "photos", key: "photos/" },
      { type: "file", name: "cat.jpg", key: "cat.jpg" },
      { type: "file", name: "dog.png", key: "dog.png" },
    ]);
  });

  it("/api/list filters only images", async () => {
    const req = new Request("http://localhost/api/list?path=");
    const res = await worker.default.fetch(req, mockEnv);
    const data = await res.json();
    expect(data.items.some((i) => i.name === "notes.txt")).toBe(false);
  });

  it("/api/image returns image if found", async () => {
    const req = new Request("http://localhost/api/image?key=cat.jpg");
    const res = await worker.default.fetch(req, mockEnv);
    expect(res.status).toBe(200);
    const arr = new Uint8Array(await res.arrayBuffer());
    expect(arr).toEqual(new Uint8Array([1, 2, 3]));
  });

  it("/api/image returns 404 if not found", async () => {
    const req = new Request("http://localhost/api/image?key=notfound.jpg");
    const res = await worker.default.fetch(req, mockEnv);
    expect(res.status).toBe(404);
  });
});
