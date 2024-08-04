import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/setup/5')({
  component: () => <div>Hello /setup/5!</div>
})

