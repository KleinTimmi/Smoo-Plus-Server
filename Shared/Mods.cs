using System.Collections.Generic;

namespace Shared;

public struct Mod {
    public string Name;
    public string Description;
    public string Author;
    public string Version;
    public string DownloadLink;
    public bool IsEnabled;
}

public static class Mods {
    public static List<Mod> AvailableMods = new List<Mod> {
        new Mod {
            Name = "Kingdom Expansion",
            Description = "Erweitert das Spiel um neue Königreiche",
            Author = "Kratzean",
            Version = "1.0.0",
            DownloadLink = "https://gamebanana.com/mods/568934",
            IsEnabled = false
        },
        new Mod {
            Name = "Fluffy Bluff Kingdom",
            Description = "Adds a new Kingdom to the game",
            Author = "Slycer",
            Version = "1.0.0",
            DownloadLink = "https://gamebanana.com/mods/585922",
            IsEnabled = false
        },
    };

    public static Mod? GetModByName(string name) {
        return AvailableMods.Find(mod => mod.Name == name);
    }

    public static void EnableMod(string name) {
        var mod = AvailableMods.FindIndex(m => m.Name == name);
        if (mod != -1) {
            var tempMod = AvailableMods[mod];
            tempMod.IsEnabled = true;
            AvailableMods[mod] = tempMod;
        }
    }

    public static void DisableMod(string name) {
        var mod = AvailableMods.FindIndex(m => m.Name == name);
        if (mod != -1) {
            var tempMod = AvailableMods[mod];
            tempMod.IsEnabled = false;
            AvailableMods[mod] = tempMod;
        }
    }
}