import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { convertMovToGif } from "~/models/file.server";

export async function action({ request }: ActionArgs) {
  //get form data from request
  const body = await request.formData();
  //get file from form data
  const file = body.get("file") as File;
  //convert file to gif

  const gif = await convertMovToGif(file);
  console.log("results: ", gif);
  return json({ response: gif });
}
