import { motion } from "framer-motion";

interface DeleteUserModalProps {
  userToDelete: { userName: string; userId: string };
  cancel: () => void;
}
export default function DeleteUserModal({
  userToDelete,
  cancel,
}: DeleteUserModalProps) {

  return (
    <div className="absolute z-10 flex h-full w-full flex-row justify-center p-6 backdrop-blur">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.4 }}
        exit={{ scale: 0, opacity: 0 }}
        className="top-1/2 mb-24 flex h-1/4 w-1/2 flex-col items-center rounded-lg bg-slate-900 p-12"
      >
        <span className="text-3xl font-bold text-white">
          Are you sure you want to delete {userToDelete?.userName}?
        </span>
        <span className="text-2xl font-bold text-red-400">
          This cannot be undone.
        </span>
        <div className="flex w-full flex-row justify-between py-32">
          <motion.button
            whileHover={{
              scale: 1.1,
              backgroundColor: "#C43E3E",
              color: "#7A1A1A",
            }}
            whileTap={{ scale: 0.9 }}
            className="w-5/12 rounded-lg bg-red-400 p-2 text-white"
            // onClick={() => deleteUser.mutate({ userId: userToDelete.userId })}
          >
            Delete
          </motion.button>
          <motion.button
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{ scale: 0.9 }}
            className="w-5/12 rounded-lg bg-slate-500 p-2 text-white"
            onClick={() => cancel()}
          >
            Cancel
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
