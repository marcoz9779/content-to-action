"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation, Loader2, X, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Store {
  name: string;
  address: string;
  rating: number | null;
  distance: string;
  lat: number;
  lng: number;
  placeId: string;
}

export function NearbyStores() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const findStores = useCallback(async () => {
    setLoading(true);

    try {
      // Get user location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
        });
      });

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      setUserLocation({ lat, lng });

      // Use Google Maps embed search — no API key needed for basic search
      // We'll show a map + directions links instead of Places API (which needs billing)
      const defaultStores: Store[] = [
        { name: "Migros", address: "In deiner Nähe suchen", rating: null, distance: "", lat, lng, placeId: "migros" },
        { name: "Coop", address: "In deiner Nähe suchen", rating: null, distance: "", lat, lng, placeId: "coop" },
        { name: "Aldi", address: "In deiner Nähe suchen", rating: null, distance: "", lat, lng, placeId: "aldi" },
        { name: "Lidl", address: "In deiner Nähe suchen", rating: null, distance: "", lat, lng, placeId: "lidl" },
        { name: "Denner", address: "In deiner Nähe suchen", rating: null, distance: "", lat, lng, placeId: "denner" },
        { name: "Volg", address: "In deiner Nähe suchen", rating: null, distance: "", lat, lng, placeId: "volg" },
      ];

      setStores(defaultStores);
      setOpen(true);
    } catch {
      toast.error("Standort konnte nicht ermittelt werden. Bitte erlaube den Zugriff.");
    } finally {
      setLoading(false);
    }
  }, []);

  function openInMaps(storeName: string) {
    if (!userLocation) return;
    const query = encodeURIComponent(`${storeName} near me`);
    // Universal link that works on iOS (Apple Maps) and Android/Desktop (Google Maps)
    const url = `https://www.google.com/maps/search/${query}/@${userLocation.lat},${userLocation.lng},14z`;
    window.open(url, "_blank");
  }

  function openAllStores() {
    if (!userLocation) return;
    const query = encodeURIComponent("Supermarkt");
    const url = `https://www.google.com/maps/search/${query}/@${userLocation.lat},${userLocation.lng},14z`;
    window.open(url, "_blank");
  }

  const STORE_COLORS: Record<string, string> = {
    migros: "bg-orange-500",
    coop: "bg-red-600",
    aldi: "bg-blue-600",
    lidl: "bg-yellow-500",
    denner: "bg-red-500",
    volg: "bg-green-600",
  };

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={open ? () => setOpen(false) : findStores}
        disabled={loading}
        className="gap-1.5"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : open ? (
          <X className="h-4 w-4" />
        ) : (
          <MapPin className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">{open ? "Schliessen" : "Einkaufen"}</span>
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden"
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4" />
                    Einkaufsmöglichkeiten
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={openAllStores} className="gap-1 text-xs">
                    <ExternalLink className="h-3 w-3" />
                    Alle auf Karte
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Embedded Map */}
                {userLocation && (
                  <div className="mb-4 overflow-hidden rounded-lg border">
                    <iframe
                      width="100%"
                      height="200"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps/embed/v1/search?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=Supermarkt&center=${userLocation.lat},${userLocation.lng}&zoom=14`}
                      title="Supermärkte in der Nähe"
                    />
                  </div>
                )}

                {/* Store Links */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {stores.map((store) => (
                    <button
                      key={store.placeId}
                      onClick={() => openInMaps(store.name)}
                      className="flex items-center gap-2.5 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold ${STORE_COLORS[store.placeId] ?? "bg-gray-500"}`}>
                        {store.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{store.name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Navigation className="h-2.5 w-2.5" />
                          Route
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Quick search buttons */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {["Bäckerei", "Metzgerei", "Bio-Laden", "Markt", "Getränkemarkt"].map((type) => (
                    <Button
                      key={type}
                      variant="secondary"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        if (!userLocation) return;
                        const query = encodeURIComponent(`${type} near me`);
                        window.open(`https://www.google.com/maps/search/${query}/@${userLocation.lat},${userLocation.lng},14z`, "_blank");
                      }}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
