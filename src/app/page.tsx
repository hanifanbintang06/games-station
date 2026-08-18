import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="w-full h-screen">
      <main className="w-full h-screen flex justify-center items-center">
        <Link href={`/home`}>Dashboard</Link>
      </main>
    </div>
  );
}
