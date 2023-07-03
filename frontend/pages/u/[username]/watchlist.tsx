import Navbar from "@/components/Navbar";
import ProfileNav from "@/components/ProfileNav";
import Footer from "@/components/Footer";

export default function WatchlistPage() {
  return <div className="wrapper">
    <Navbar />
    <div className="content">
      <ProfileNav />

      <h1>
        Watchlist Page
      </h1>
    </div>
    <Footer />
  </div>
}