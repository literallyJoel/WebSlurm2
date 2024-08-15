import { motion } from "framer-motion";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronsUpDown } from "lucide-react";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import Loading from "@/components/ui/loading";


export default function CreateUserForm() {

  const formSchema = z
    .object({
      localAccount: z.boolean().default(false),
      email: z.string().email(),
      name: z.string().optional(),
      generatePassword: z.boolean().default(false),
      password: z
        .string()
        .min(8)
        .regex(/[A-Z]/)
        .regex(/[a-z]/)
        .regex(/\d/)
        .regex(/\W/)
        .optional(),
      confirmPassword: z
        .string()
        .min(8)
        .regex(/[A-Z]/)
        .regex(/[a-z]/)
        .regex(/\d/)
        .regex(/\W/)
        .optional(),
      role: z
        .string()
        .refine((role) => role === "0" || role === "1", "Role must be 0 or 1"),
      organisationId: z.string().uuid(),
      organisationRole: z
        .string()
        .refine(
          (role) => role === "0" || role === "1" || role === "2",
          "Role must be 0, 1, or 2"
        ),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      localAccount: false,
      generatePassword: false,
    },
  });

  const watchIsLocal = form.watch("localAccount", false);
  const watchGeneratePassword = form.watch("generatePassword", false);

  function onSubmit(data: z.infer<typeof formSchema>) {
    console.log("Form submitted with data:", data);
    // const {
    //   email,
    //   name,
    //   role,
    //   organisationId,
    //   organisationRole,
    //   password,
    //   generatePassword,
    // } = data;
   
  }

//   if (!organisations) {
//     return (
//       <div className="flex w-full flex-row items-center justify-center py-16">
//         <Loading className="bg-fuchsia-600" />
//       </div>
//     );
//   }

  return (
    <>
      <CardHeader>
        <CardTitle className="flex flex-row justify-between">
          <div>Add User</div>
        </CardTitle>
        <CardDescription className="text-slate-400">
          You can create a new user here. If they'll be logging in with an
          external provider, you just need to enter their email and their role.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="localAccount"
              render={({ field }) => (
                <FormItem>
                  <div className="flex w-full flex-row items-center justify-between">
                    <FormLabel>Local Account? (Not Recommended)</FormLabel>
                    <FormMessage />
                  </div>
                  <FormControl>
                    <Checkbox
                      className="h-8 w-8 border-white transition-colors duration-200 hover:bg-slate-700 data-[state=checked]:bg-slate-800"
                      {...form.register("localAccount")}
                      onCheckedChange={field.onChange}
                      checked={field.value}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div className="flex w-full flex-row items-center justify-between">
                    <FormLabel>Email</FormLabel>
                    <FormMessage />
                  </div>
                  <FormControl>
                    <Input
                      className="text-black"
                      placeholder="John@Doe.com"
                      {...field}
                    />
                  </FormControl>
                  {!watchIsLocal && (
                    <FormDescription className="text-slate-400">
                      Ensure this matches the email for the account they're
                      signing in with.
                    </FormDescription>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl className="flex flex-row gap-4">
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={"0"}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="cursor-pointer"
                      >
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem
                              className="border-white text-slate-800"
                              value="0"
                            />
                          </FormControl>
                          <FormLabel className="px-2">User</FormLabel>
                        </FormItem>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="cursor-pointer"
                      >
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem
                              className="border-white text-slate-800"
                              value="1"
                            />
                          </FormControl>
                          <FormLabel className="px-2">Admin</FormLabel>
                        </FormItem>
                      </motion.div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <>
              <FormField
                control={form.control}
                name="organisationId"
                render={({ field }) => (
                  <FormItem className="w-full pt-3">
                    <div className="flex w-full flex-row items-center justify-between">
                      <FormLabel>Organisation</FormLabel>
                      <FormMessage />
                    </div>
                    <Popover>
                      <PopoverTrigger
                        className="bg-white hover:bg-white/80"
                        asChild
                      >
                        <FormControl>
                          <Button
                            role="combobox"
                            className={cn(
                              "w-full justify-between text-black",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {/* {field.value
                              ? (organisations.find(
                                  (org) => org.id === field.value
                                )?.name ?? "Select an organisation")
                              : "Select an organisation"} */}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="border-none bg-transparent p-0">
                        <motion.div
                          initial={{ opacity: 0, y: 0 }}
                          animate={{ opacity: 1, y: 20 }}
                          exit={{ opacity: 0, y: 0 }}
                        >
                          <Command className="rounded-lg border border-none bg-slate-800 text-white shadow-md ">
                            <CommandInput placeholder="Search for an organisation..." />
                            <CommandList>
                              <CommandEmpty>No results found.</CommandEmpty>
                              <CommandGroup>
                                {/* {organisations.map((org) => (
                                  <CommandItem
                                    className="bg-slate-800 text-white hover:bg-slate-700"
                                    onSelect={() => {
                                      form.setValue("organisationId", org.id);
                                    }}
                                    key={org.id}
                                    value={field.value}
                                  >
                                    <span>{org.name}</span>
                                  </CommandItem>
                                ))} */}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </motion.div>
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="organisationRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organisation Role</FormLabel>
                    <FormControl className="flex flex-row gap-4">
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={"0"}
                      >
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="cursor-pointer"
                        >
                          <FormItem>
                            <FormControl>
                              <RadioGroupItem
                                className="border-white text-slate-800"
                                value="0"
                              />
                            </FormControl>
                            <FormLabel className="px-2">User</FormLabel>
                          </FormItem>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="cursor-pointer"
                        >
                          <FormItem>
                            <FormControl>
                              <RadioGroupItem
                                className="border-white text-slate-800"
                                value="1"
                              />
                            </FormControl>
                            <FormLabel className="px-2">Moderator</FormLabel>
                          </FormItem>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="cursor-pointer"
                        >
                          <FormItem>
                            <FormControl>
                              <RadioGroupItem
                                className="border-white text-slate-800"
                                value="2"
                              />
                            </FormControl>
                            <FormLabel className="px-2">Admin</FormLabel>
                          </FormItem>
                        </motion.div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>

            {watchIsLocal && (
              <>
                <FormField
                  control={form.control}
                  name="generatePassword"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex w-full flex-row items-center justify-between">
                        <FormLabel>Generate Random Password?</FormLabel>
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Checkbox
                          className="h-8 w-8 border-white transition-colors duration-200 hover:bg-slate-700 data-[state=checked]:bg-slate-800"
                          {...form.register("generatePassword")}
                          onCheckedChange={field.onChange}
                          checked={field.value}
                        />
                      </FormControl>
                      <FormDescription className="text-slate-400">
                        Generated passwords will be emailed to the user.
                      </FormDescription>
                    </FormItem>
                  )}
                />
                {!watchGeneratePassword && (
                  <>
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex w-full flex-row items-center justify-between">
                            <FormLabel>Password</FormLabel>
                            <FormMessage />
                          </div>
                          <FormControl>
                            <Input
                              className="text-black"
                              type="password"
                              placeholder="********"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex w-full flex-row items-center justify-between">
                            <FormLabel>Confirm Password</FormLabel>
                            <FormMessage />
                          </div>
                          <FormControl>
                            <Input
                              className="text-black"
                              type="password"
                              placeholder="********"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </>
            )}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-full rounded-lg bg-slate-800 p-2 text-white transition-colors duration-200 hover:bg-fuchsia-600"
            >
              Create User
            </motion.button>
          </form>
        </Form>
      </CardContent>
    </>
  );
}
