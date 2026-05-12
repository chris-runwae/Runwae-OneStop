import Link from "next/link";
import { Button } from "@runwae/ui/components/button";
import { Nav } from "@/components/marketing/nav";
import { Footer } from "@/components/marketing/footer";
import { Container } from "@/components/marketing/container";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex flex-1 items-center justify-center py-24">
        <Container className="max-w-xl text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            404
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            That page took a different runway.
          </h1>
          <p className="mt-4 text-muted-foreground">
            The page you&rsquo;re looking for has moved or never existed. Try
            heading home.
          </p>
          <Button asChild className="mt-8">
            <Link href="/">Back to home</Link>
          </Button>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
