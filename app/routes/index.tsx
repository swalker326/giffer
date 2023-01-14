import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { convertMovToGif } from "~/models/file.server";

export async function loader({ request }: LoaderArgs) {
  //get form data from request
  // console.log(request);
  return json({ response: "hello" });
}

export async function action({ request }: ActionArgs) {
  const body = await request.formData();
  const file = body.get("file") as File;
  const gif = await convertMovToGif(file);
  if (!gif) return json({ error: "Could not convert file" }, { status: 500 });
  // console.log("gif in action: ", gif);
  return json({ gif });
}

export default function Index() {
  const fetcher = useFetcher();
  function base64ToImgUrl(base64: string): string {
    const binaryString = atob(base64);
    // const binaryString = Buffer.from(base64, "base64").toString("binary");
    const array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      array[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([array], { type: "image/gif" });
    return URL.createObjectURL(blob);
  }

  const [file, setFile] = useState<any>(null);
  useEffect(() => {
    // console.log(fetcher.data);
    if (fetcher.data?.gif) {
      const getFileurl = async () => {
        setFile(base64ToImgUrl(fetcher.data.gif));
      };
      getFileurl();
      // console.log(fetcher.data.gif);
      // //convert binary file to URL
      // const url = await fileToDataURL(fetcher.data.gif);
      // console.log(url);
      // setFile(url);
    }
    // if (fetcher?.data?.gif) {
    //   setFile(fetcher.data.gif);
    // }
  }, [fetcher.data]);
  return (
    <main className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center">
      <div>
        <header className="my-2 rounded-lg  bg-black py-3 text-white">
          <div className="flex justify-center">
            <h1 className="text-2xl font-medium">
              Upload a{" "}
              <span className="rounded-full bg-purple-500 p-3">*.mov</span> file
            </h1>
          </div>
        </header>
        <fetcher.Form method="post" encType="multipart/form-data">
          <input
            id="file"
            type="file"
            name="file"
            accept="video/mov"
            // onChange={(e) => {
            //   if (!e.target.files) return;
            //   const file = e.target.files[0];
            //   console.log(file);
            // }}
          />
          <button
            className="rounded-md bg-purple-500 py-2 px-4 font-medium text-white hover:bg-purple-300"
            type="submit"
            disabled={fetcher.state === "loading"}
          >
            Convert
          </button>
        </fetcher.Form>
        {file && (
          <div>
            <a
              className="rounded-md bg-purple-600 py-2 px-4 font-medium text-white"
              download
              href={file}
            >
              Download
            </a>

            <img style={{ width: "400px" }} src={file} alt="gif" />
          </div>
        )}
      </div>
    </main>
  );
}
