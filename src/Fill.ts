export function fillTransparent(canvas: HTMLCanvasElement, alphaThreshold = 0): HTMLCanvasElement {
  const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
  if (!ctx) return canvas;

  const w: number = canvas.width;
  const h: number = canvas.height;
  if (w === 0 || h === 0) return canvas;

  const img: ImageData = ctx.getImageData(0, 0, w, h);
  const data: Uint8ClampedArray = img.data;
  const total: number = w * h;

  const visited: Uint8Array = new Uint8Array(total); // 0 = unvisited, 1 = visited
  const assigned: Uint8ClampedArray = new Uint8ClampedArray(total * 4); // r,g,b,a for each pixel
  const queue: Uint32Array = new Uint32Array(total); // BFS queue (indices)
  let qHead = 0;
  let qTail = 0;

  // initialize: enqueue all non-transparent pixels as BFS sources
  for (let i = 0, p = 0; i < total; ++i, p += 4) {
    const a: number = data[p + 3];
    if (a > alphaThreshold) {
      visited[i] = 1;
      assigned[p] = data[p];
      assigned[p + 1] = data[p + 1];
      assigned[p + 2] = data[p + 2];
      assigned[p + 3] = a;
      queue[qTail++] = i;
    }
  }

  // nothing to propagate
  if (qHead === qTail) return canvas;

  // BFS neighbors using linear indices; check row boundaries for left/right
  while (qHead < qTail) {
    const idx: number = queue[qHead++];
    const pos: number = idx * 4;
    const y: number = Math.floor(idx / w);
    const x: number = idx - y * w;

    // right
    if (x + 1 < w) {
      const nIdx: number = idx + 1;
      if (!visited[nIdx]) {
        const nPos: number = nIdx * 4;
        assigned[nPos] = assigned[pos];
        assigned[nPos + 1] = assigned[pos + 1];
        assigned[nPos + 2] = assigned[pos + 2];
        assigned[nPos + 3] = assigned[pos + 3];
        visited[nIdx] = 1;
        queue[qTail++] = nIdx;
      }
    }

    // left
    if (x - 1 >= 0) {
      const nIdx: number = idx - 1;
      if (!visited[nIdx]) {
        const nPos: number = nIdx * 4;
        assigned[nPos] = assigned[pos];
        assigned[nPos + 1] = assigned[pos + 1];
        assigned[nPos + 2] = assigned[pos + 2];
        assigned[nPos + 3] = assigned[pos + 3];
        visited[nIdx] = 1;
        queue[qTail++] = nIdx;
      }
    }

    // down
    if (y + 1 < h) {
      const nIdx: number = idx + w;
      if (!visited[nIdx]) {
        const nPos: number = nIdx * 4;
        assigned[nPos] = assigned[pos];
        assigned[nPos + 1] = assigned[pos + 1];
        assigned[nPos + 2] = assigned[pos + 2];
        assigned[nPos + 3] = assigned[pos + 3];
        visited[nIdx] = 1;
        queue[qTail++] = nIdx;
      }
    }

    // up
    if (y - 1 >= 0) {
      const nIdx: number = idx - w;
      if (!visited[nIdx]) {
        const nPos: number = nIdx * 4;
        assigned[nPos] = assigned[pos];
        assigned[nPos + 1] = assigned[pos + 1];
        assigned[nPos + 2] = assigned[pos + 2];
        assigned[nPos + 3] = assigned[pos + 3];
        visited[nIdx] = 1;
        queue[qTail++] = nIdx;
      }
    }
  }

  // write filled colors back only for originally transparent pixels
  for (let i = 0, p = 0; i < total; ++i, p += 4) {
    if (data[p + 3] <= alphaThreshold && assigned[p + 3] !== 0) {
      data[p] = assigned[p];
      data[p + 1] = assigned[p + 1];
      data[p + 2] = assigned[p + 2];
      data[p + 3] = assigned[p + 3] || 255; // preserve assigned alpha if present, otherwise make fully opaque
    }
  }

  ctx.putImageData(img, 0, 0);
  return canvas;
}
