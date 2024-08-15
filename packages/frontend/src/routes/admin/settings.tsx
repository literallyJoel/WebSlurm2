import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
export const Route = createFileRoute("/admin/settings")({
  component: () => <AdminSettings />,
});

export default function AdminSettings() {
  return (
    <>
      <div className="flex w-full font-bold text-xl flex-row items-center justify-center p-2">
        Admin <span className="text-fuchsia-600">Settings</span>
      </div>
      <Tabs defaultValue="users" className="w-full p-2">
        <TabsList className="w-full bg-slate-800">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <TabsTrigger
              className="data-[state=active]:bg-slate-600 data-[state=active]:text-white"
              value="users"
            >
              Users
            </TabsTrigger>
          </motion.div>

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <TabsTrigger
              className="data-[state=active]:bg-slate-600 data-[state=active]:text-white"
              value="organisations"
            >
              Organisations
            </TabsTrigger>
          </motion.div>

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <TabsTrigger
              className="data-[state=active]:bg-slate-600 data-[state=active]:text-white"
              value="jobTypes"
            >
              Global Job Types
            </TabsTrigger>
          </motion.div>
        </TabsList>
        <AnimatePresence>
          <TabsContent value="users"></TabsContent>
          <TabsContent value="organisations"></TabsContent>
        </AnimatePresence>
      </Tabs>
    </>
  );
}
