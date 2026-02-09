import { NextRequest, NextResponse } from "next/server";

const W3S_API_URL = "https://api.web3.storage/upload";

export async function POST(request: NextRequest) {
  const token = process.env.NEXT_PUBLIC_WEB3STORAGE_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "Web3.Storage token not configured" },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();

    const response = await fetch(W3S_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Name": file.name,
      },
      body: buffer,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Web3.Storage upload failed:", text);
      return NextResponse.json(
        { error: "IPFS upload failed" },
        { status: response.status }
      );
    }

    const data = (await response.json()) as { cid: string };
    const cid = data.cid;
    const imageUrl = `https://w3s.link/ipfs/${cid}`;

    return NextResponse.json({ cid, imageUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
