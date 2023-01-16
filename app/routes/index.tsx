import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { convertMovToGif } from "~/models/file.server";
import loop from "../../public/assets/loop.gif";

export async function action({ request }: ActionArgs) {
  const body = await request.formData();
  const file = body.get("file") as File;
  const gif = await convertMovToGif(file);
  if (!gif) return json({ error: "Could not convert file" }, { status: 500 });
  return json({ gif });
}

export default function Index() {
  const fetcher = useFetcher();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<string>(loop);
  const [fileSelected, setFileSelected] = useState(false);

  function base64ToImgUrl(base64: string): string {
    const binaryString = atob(base64);
    const array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      array[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([array], { type: "image/gif" });
    return URL.createObjectURL(blob);
  }

  useEffect(() => {
    if (fetcher.data?.gif) {
      const getFileurl = async () => {
        setFile(base64ToImgUrl(fetcher.data.gif));
      };
      getFileurl();
    }
  }, [fetcher.data]);

  useEffect(() => {
    setIsLoading(fetcher.state === "loading" || fetcher.state === "submitting");
  }, [fetcher.state]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileSelected(true);
    }
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (inputRef.current) {
        const dt = new DataTransfer();
        dt.items.add(file);
        inputRef.current.files = dt.files;
        setFileSelected(true);
      }
    }
  };

  return (
    <main className="relative flex min-h-screen justify-center bg-white px-2 py-4">
      <div className="mx-auto flex flex-col justify-between">
        <div>
          <div>
            <header className="my-2 rounded-lg  bg-black py-3 text-white">
              <div className="group flex justify-center">
                <h1 className="flex items-center text-2xl font-medium">
                  Upload a
                  <div className="rounded-full bg-purple-500 p-3 transition-transform duration-300 group-hover:translate-x-5 group-hover:-translate-y-2 group-hover:scale-105">
                    *.mov
                  </div>
                </h1>
              </div>
            </header>
            <fetcher.Form method="post" encType="multipart/form-data">
              <div className="flex-col items-center justify-center">
                <label>
                  <div
                    onDrop={handleDrop}
                    className="relative flex min-h-[110px] w-full flex-col items-center rounded-sm border border-dashed border-purple-500 p-3"
                  >
                    <h3 className="mb-2 text-2xl">Drop a file or</h3>
                    <input
                      ref={inputRef}
                      name="file"
                      type="file"
                      accept="video/mp4,video/x-m4v,video/*"
                      onChange={handleFileChange}
                      className="file:text-md py-2 text-sm file:mr-2 file:rounded-md file:border-0 file:bg-purple-500 file:py-2 file:px-6 file:font-medium file:text-white hover:file:cursor-pointer hover:file:bg-purple-700 "
                    />
                    <button
                      className=" absolute bottom-1 right-1 flex h-7 w-20 items-center justify-center rounded-md bg-purple-500 py-2 px-4 text-white enabled:hover:bg-purple-700  disabled:text-gray-300 disabled:opacity-60"
                      type="submit"
                      disabled={isLoading || !fileSelected}
                    >
                      {isLoading ? (
                        <div className="h-fit w-fit">
                          <LoaderIcon />
                        </div>
                      ) : (
                        "Convert"
                      )}
                    </button>
                  </div>
                </label>
              </div>
            </fetcher.Form>
            {file && (
              <div className="group mt-4 flex w-full items-start justify-center">
                <a className="relative" download href={file}>
                  <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform rounded-md bg-purple-600 py-2 px-4 font-medium text-white transition-opacity duration-700 ease-in-out md:opacity-0 md:group-hover:opacity-70">
                    Download
                  </button>
                  <img style={{ width: "400px" }} src={file} alt="gif" />
                </a>
              </div>
            )}
          </div>
        </div>
        <footer className="w-full py-2 text-center text-xs text-gray-500">
          <p>
            Made with{" "}
            <a
              className="text-purple-500"
              href="https://remix.run/"
              target="_blank"
              rel="noreferrer"
            >
              Remix Run
            </a>{" "}
            and{" "}
            <a
              className="text-purple-500"
              href="https://ffmpeg.org/"
              target="_blank"
              rel="noreferrer"
            >
              ffmpeg
            </a>{" "}
            by{" "}
            <a
              className="text-purple-500"
              href="https://twitter.com/swalker326"
              target="_blank"
              rel="noreferrer"
            >
              @swalker326
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}

const LoaderIcon = () => {
  return (
    <div role="status">
      <svg
        aria-hidden="true"
        className="h-6 w-6 animate-spin fill-white text-gray-200 dark:text-gray-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
};
