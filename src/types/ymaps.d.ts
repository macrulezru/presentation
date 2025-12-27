declare namespace ymaps {
  interface MapOptions {
    center?: number[];
    zoom?: number;
    controls?: string[];
    behaviors?: string[];
  }

  interface IPlacemarkOptions {
    iconLayout?: string;
    iconImageHref?: string;
    iconImageSize?: number[];
    iconImageOffset?: number[];
  }

  interface IEvent {
    get(type: string): any;
  }

  class Map {
    constructor(element: string | HTMLElement, options?: MapOptions);
    geoObjects: GeoObjectCollection;
    events: EventManager;
    behaviors: BehaviorManager;
    setCenter(center: number[]): void;
    setZoom(zoom: number): void;
    destroy(): void;
  }

  class Placemark {
    constructor(coordinates: number[], properties?: any, options?: IPlacemarkOptions);
  }

  class GeoObjectCollection {
    add(geoObject: Placemark): void;
    remove(geoObject: Placemark): void;
  }

  class EventManager {
    add(type: string, callback: (event: IEvent) => void): void;
  }

  class BehaviorManager {
    enable(behavior: string): void;
  }

  function ready(callback: () => void): void;
}
