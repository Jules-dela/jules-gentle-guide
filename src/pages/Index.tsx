import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Landing from "@/components/landing/Landing";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          const offset = 72;
          const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top, behavior: "smooth" });
        }
      }, 100);
    }
  }, [location.hash]);

  return <Landing />;
};

export default Index;
