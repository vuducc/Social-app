import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface NetworkContextType {
  isOnline: boolean;
  isConnectionSlow: boolean;
  connectionQuality: "good" | "slow" | "offline";
}

const NetworkContext = createContext<NetworkContextType>({
  isOnline: true,
  isConnectionSlow: false,
  connectionQuality: "good",
});

export const NetworkProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isConnectionSlow, setIsConnectionSlow] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<
    "good" | "slow" | "offline"
  >("good");

  const checkConnectionSpeed = async () => {
    try {
      const connection = (navigator as any).connection;
      if (connection) {
        const isSlowConnection =
          connection.effectiveType === "slow-2g" ||
          connection.effectiveType === "2g" ||
          connection.downlink < 1;

        setIsConnectionSlow(isSlowConnection);
        setConnectionQuality(isSlowConnection ? "slow" : "good");

        if (isSlowConnection) {
          toast.error("Kết nối internet yếu, vui lòng kiểm tra đường truyền", {
            duration: 3000,
            icon: "🤔",
          });
        }
      }
    } catch (error) {
      console.error("Error checking connection speed:", error);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionQuality("good");
      toast.success("Kết nối internet đã được khôi phục", {
        duration: 3000,
        icon: "✅",
      });
      checkConnectionSpeed(); // Kiểm tra tốc độ sau khi kết nối lại
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionQuality("offline");
      toast.error("Mất kết nối internet", {
        duration: 5000,
        icon: "❌",
      });
    };

    // Kiểm tra kết nối ban đầu
    checkConnectionSpeed();

    // Theo dõi sự thay đổi kết nối
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Kiểm tra định kỳ mỗi 30 giây
    const intervalId = setInterval(checkConnectionSpeed, 30000);

    if ((navigator as any).connection) {
      (navigator as any).connection.addEventListener(
        "change",
        checkConnectionSpeed
      );
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(intervalId);
      if ((navigator as any).connection) {
        (navigator as any).connection.removeEventListener(
          "change",
          checkConnectionSpeed
        );
      }
    };
  }, []);

  return (
    <NetworkContext.Provider
      value={{ isOnline, isConnectionSlow, connectionQuality }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);
