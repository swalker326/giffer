import {
	AlertDialog,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogCancel,
	AlertDialogAction,
} from "~/components/ui/alert-dialog";
import { XIcon } from "lucide-react";
import {
	AlertDialogHeader,
	AlertDialogFooter,
} from "~/components/ui/alert-dialog";

export const DeleteConfirmationAlert = ({
	cancelText,
	deleteText,
	onConfirm,
}: {
	cancelText: string;
	deleteText: string;
	onConfirm: () => void;
}) => {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<button type="button" className="p-1 hover:bg-gray-300 rounded-full">
					<XIcon className=" text-red-600 hidden group-hover:block w-5 h-5" />
				</button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently delete your
						account and remove your data from our servers.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>{cancelText || "No Cancel"}</AlertDialogCancel>
					<AlertDialogAction
						onClick={() => {
							onConfirm();
						}}
					>
						{deleteText || "Delete"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
