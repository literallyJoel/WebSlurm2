import { motion } from "framer-motion";
import { CircleCheck } from "lucide-react";

interface props {
  name: string;
  img: string;
  toggleProvider: (provider: string) => void;
  providers: string[];
}

export function ProviderButton({
  name,
  img,
  toggleProvider,
  providers,
}: props) {
  return (
    <motion.button
      onClick={() => toggleProvider(name)}
      whileHover={{ scale: 1.1 }}
      className="z-1 relative flex w-1/2 flex-col items-center justify-center gap-2 rounded-lg bg-slate-900 p-4"
    >
      <motion.div
        className="absolute -right-2 -top-2"
        key={name}
        initial={false}
        animate={providers.includes(name) ? { scale: 1 } : { scale: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
      >
        <CircleCheck className="z-100 size-6 rounded-full bg-green-600 text-white" />
      </motion.div>

      <img src={img} alt={name} />
      <div className="font-semibold text-white">{name}</div>
    </motion.button>
  );
}
