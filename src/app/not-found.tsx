import Link from "next/link";
import { Icon } from "@/components/Icon";

export default function NotFound() {
  return (
    <div className="status-page">
      <div className="status-symbol"><span className="text-sm font-medium">404</span></div>
      <h1 className="page-title">A little off the beaten path.</h1>
      <p>We couldn’t find this page. It may have moved, or the piece you’re looking for may no longer be available.</p>
      <Link href="/#collection" className="button mt-8">Back to the collection <Icon name="arrow" /></Link>
    </div>
  );
}
