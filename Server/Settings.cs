using System.Net;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using Shared;

namespace Server;

public class Settings {
    private static readonly Logger Logger = new ("Settings");
    public static Action? LoadHandler;
    
    private static SettingsData Instance { get; set; } = new();

    public static void LoadSettings() {
        bool needSave = false;
        if (File.Exists("settings.json")) {
            string text = File.ReadAllText("settings.json");
            try {
                Instance = JsonConvert.DeserializeObject<SettingsData>(text, new StringEnumConverter(new CamelCaseNamingStrategy())) ?? Instance;
                Logger.Info("Loaded settings from settings.json");
            }
            catch (Exception e) {
                Logger.Warn($"Failed to load settings.json: {e}");
                needSave = true;
            }
        } else {
            needSave = true;
        }
        if (needSave) SaveSettings();
        LoadHandler?.Invoke();
    }

    public static void SaveSettings(bool silent = false) {
        try {
            File.WriteAllText("settings.json", JsonConvert.SerializeObject(Instance, Formatting.Indented, new StringEnumConverter(new CamelCaseNamingStrategy())));
            if (!silent) { Logger.Info("Saved settings to settings.json"); }
        }
        catch (Exception e) {
            Logger.Error($"Failed to save settings.json {e}");
        }
    }

    public static ServerTable Server => Instance.Server;
    public static BanListTable BanList => Instance.BanList;
    public static DiscordTable Discord => Instance.Discord;
    public static SyncTable Syncing => Instance.Syncing;
    public static JsonApiTable JsonApi => Instance.JsonApi;
    public static AviscribeTable Aviscribe => Instance.Aviscribe;
    
    public static SettingsData GetSettingsData() => Instance;


    public class SettingsData
    {
        public ServerTable Server { get; set; } = new();
        public BanListTable BanList { get; set; } = new();

        public DiscordTable Discord { get; set; } = new();
        public SyncTable Syncing { get; set; } = new();
        public JsonApiTable JsonApi { get; set; } = new();
        public AviscribeTable Aviscribe { get; set; } = new();
    }

    public class ServerTable
    {
        public string Address { get; set; } = IPAddress.Any.ToString();
        public ushort Port { get; set; } = 1027;
        public ushort MaxPlayers { get; set; } = 8;
    }

    public class BanListTable
    {
        public bool Enabled { get; set; }
        public ISet<Guid> Players { get; set; } = new SortedSet<Guid>();
        public ISet<string> IpAddresses { get; set; } = new SortedSet<string>();
        public ISet<string> Stages { get; set; } = new SortedSet<string>();
        public ISet<sbyte> GameModes { get; set; } = new SortedSet<sbyte>();
    }

    public class DiscordTable
    {
        public string? Token { get; set; } = null;
        public string Prefix { get; set; } = "$";
        public string? CommandChannel { get; set; } = null;
        public string? LogChannel { get; set; } = null;
    }


    public class SyncTable
    {
        public class ShineTable
        {
            public bool Enabled { get; set; } = true;
            public bool ClearOnNewSaves { get; set; } = true;

            public class PersistShinesTable
            {
                public bool Enabled { get; set; } = false;
                public string Filename { get; set; } = "./moons.json";
            }

            public PersistShinesTable PersistShines { get; set; } = new();
        }

        public ShineTable Shines { get; set; } = new();

        public class CpTable
        {
            public bool Enabled { get; set; } = true;
            public bool CleanOnNewSaves { get; set; } = true;
        }

        public CpTable Checkpoints { get; set; } = new();

        public class MrTable
        {
            public bool Enabled { get; set; } = true;
            public bool CleanOnNewSaves { get; set; } = true;
        }

        public MrTable MoonRocks { get; set; } = new();

        public class CcTable
        {
            public bool Enabled { get; set; } = true;
            public bool CleanOnNewSaves { get; set; } = true;
        }

        public CcTable Regionals { get; set; } = new();
    }

    public class JsonApiTable
    {
        public bool Enabled { get; set; } = false;
        public Dictionary<string, SortedSet<string>> Tokens { get; set; } = new();
    }

    public class AviscribeTable
    {
        public bool Enabled { get; set; } = true;
        public int IdleExpirationMinutes { get; set; } = 30;
        public int? MaximumRunHours { get; set; }
        public int OwnerTimeoutSeconds { get; set; } = 45;
        public int WaitTimeoutSeconds { get; set; } = 25;
        public string StateFilename { get; set; } = "./aviscribe-runs.json";
        public int MaximumEventsPerRun { get; set; } = 20_000;
        public int RetainedChangeCount { get; set; } = 512;
        public int RetainedEventFeedCount { get; set; } = 200;
    }

   
}
