const decode = TextDecoder.prototype.decode.bind(new TextDecoder("utf-8"));
const encode = TextEncoder.prototype.encode.bind(new TextEncoder());

export interface Endpoints {
  Platforms: {
    EPIC: string,
    STEAM: string,
    XBOX: string,
    PSN: string
  },
  Segments: {
    Playlists: {
      Seasons: string
    }
  },
  Images: {
    Bronze: string,
    Silver: string,
    Gold: string,
    Platinum: string,
    Diamond: string,
    Champion: string,
    GrandChampion: string,
    SuperSonicLegend: string
  }
};

export interface EndpointData {
  user?: string,
  platform?: string
};

export default class RLApi {
  endpoints!: Endpoints;
  constructor() {
    this.loadEndpoints();
  }

  async loadEndpoints() {
    const data: Endpoints = JSON.parse(decode(await Deno.readFile("./api/endpoints.json")));

    this.endpoints = data;
  }

  getPlatforms(): string[] {
    return ["xbox", "psn", "steam", "epic"];
  }

  replaceEndpoint(endpoint: string, object: EndpointData) {
    return endpoint.replace(/{{([a-zA-Z]+)}}/g, (match: string, g1: keyof EndpointData): string => {
      if (object.hasOwnProperty(g1)) {
        return object[g1] as string;
      }

      return match;
    });
  }

  async getStats(player: string, platform: string) {
    if (!this.endpoints) await this.loadEndpoints();
    if (!this.getPlatforms().includes(platform)) throw Error("Incorrect platform");
    const endpoint = this.replaceEndpoint(this.endpoints.Platforms[platform.toUpperCase() as "XBOX" | "PSN" | "STEAM" | "EPIC"], { user: player });
    const resp = await fetch(endpoint).catch(console.error);
    if (!resp) return;

    if (resp.status != 200) throw Error(resp.statusText);

    const data = await resp.json();

    return data;
  }
};