/** @jsx h */
import { serve } from "https://deno.land/std@0.142.0/http/server.ts";
import { h, html } from "https://deno.land/x/htm@0.0.2/mod.tsx";
import { qrcode } from "https://deno.land/x/qrcode@v2.0.0/mod.ts";

const handler = async (req: Request) => {
  const url = new URL(req.url).searchParams.get("url") || new URL(req.url).pathname.slice(1);
  if(url === "favicon.ico") { return await fetch("https://www.roeh.ch/img/logo.png"); }
  if(url === "") {
    return html({
      scripts: [
        { src: "https://cdn.jsdelivr.net/gh/RoeHH/QR/script.js" }
      ],
      title: "QR Code Generator",
      body: (
        <div class="min-h-screen justify-center bg-gray-800">
          <form action="/info" method="get" class="grid gap-0 auto-rows-min align-middle justify-center">
            <input type="text" name="url" id="url"></input>
            <button class="text-xl text-white text-center bg-blue-600" id="button">Generate QR-Code</button>
          </form>
        </div>
      )
    })
  }

  const qr = "data:image/png" + await qrcode(url).then(qr => qr.slice(14));
  if (req.headers.get("User-Agent")?.slice(0, 4) === "Deno") {
    return new Response(`export default "${qr}"`, {
      status: 200,
      headers: {
        "Content-Type": "text/javascript",
      },
    });
  }else if(req.headers.get("sec-fetch-dest") === "image"){
    return await fetch(qr)
  }else{
    return html({
      title: "QR: " + url,
      body: (
        <div class="min-h-screen justify-center bg-gray-800">
          <div class="grid gap-0 auto-rows-min align-middle justify-center">
            <a class="h-min" href={qr} download>
              <img class="mb-0" src={qr} />
            </a>
            <h1 class="text-xl text-white text-center">{url}</h1>
          </div>
        </div>
      ),
    })
  }
};

serve(handler);    