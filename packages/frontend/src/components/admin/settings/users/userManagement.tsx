import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import { Table } from "@/components/table";

import { usersColumns } from "./table/usersColumns";
import { membershipsColumns } from "./table/membershipsColumn";
import Loading from "@/components/ui/loading";
import CreateUserForm from "./create/createUserForm";
import { useEffect, useState } from "react";

import DeleteUserModal from "./deleteUserModal";

export default function UserManagement() {
  //This is for viewing the users organisations
  const [selectedUser, setSelectedUser] = useState<string | undefined>();
  //This is for deleting a user
  const [userToDelete, setUserToDelete] = useState<
    { userId: string; userName: string } | undefined
  >();

  //Required to get the framer motion animatitons working correctly.
  const [vw, setVW] = useState(0);

  useEffect(() => {
    const updateVW = () => setVW(window.innerWidth);
    updateVW();
    window.addEventListener("resize", updateVW);
    return () => window.removeEventListener("resize", updateVW);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 1000 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 1000 }}
      transition={{ type: "spring", duration: 0.8 }}
      className="relative"
    >
      <AnimatePresence>
        {userToDelete && (
          <DeleteUserModal
            userToDelete={userToDelete}
            cancel={() => setUserToDelete(undefined)}
          />
        )}
      </AnimatePresence>

      <Card className="min-h-full border-none bg-slate-700 p-2 text-white">
        <CardHeader>
          <CardTitle className="flex flex-row justify-between">
            <div>User Settings</div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex w-full flex-row gap-2">
          <AnimatePresence mode="wait" initial={false}>
            {selectedUser ? (
              userOrganisations ? (
                <motion.div
                  key="org-memberships"
                  layoutId="tables"
                  className="flex min-h-screen w-full flex-col rounded-lg bg-slate-600 p-2"
                  initial={{ x: -vw }}
                  animate={{ x: 0 }}
                  transition={{
                    type: "spring",
                    bounce: 0.4,
                  }}
                  exit={{ x: -vw }}
                >
                  <Table
                    columns={membershipsColumns({ userId: selectedUser })}
                    data={userOrganisations}
                  />
                </motion.div>
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Loading className="h-20 w-20" />
                </div>
              )
            ) : (
              <motion.div
                key="users"
                layoutId="tables"
                initial={{ x: -vw }}
                animate={{ x: 0 }}
                transition={{
                  type: "spring",
                  bounce: 0.4,
                  duration: 0.8,
                }}
                exit={{ x: -vw }}
                className="flex min-h-screen w-full rounded-lg bg-slate-600 p-2"
              >
                {users ? (
                  <Table
                    columns={usersColumns({
                      setSelectedUser: setSelectedUser,
                      setUserToDelete: setUserToDelete,
                    })}
                    data={users}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Loading className="h-20 w-20" />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex min-h-screen w-5/12 rounded-lg bg-slate-600 p-2">
            <Card className="w-full border-none bg-transparent text-white">
              <CreateUserForm organisations={organisations} />
            </Card>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
