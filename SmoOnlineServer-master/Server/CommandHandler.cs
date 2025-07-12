using System.Runtime.InteropServices;
using System.Text;

namespace Server;

public static class CommandHandler {
    public delegate Response Handler(string[] args);

    public static Dictionary<string, Handler> Handlers = new Dictionary<string, Handler>();
    public static Dictionary<string, Handler> HiddenHandlers = new Dictionary<string, Handler>();
    public static Dictionary<string, Handler> MultiWordHandlers = new Dictionary<string, Handler>();
    public static Dictionary<string, Handler> MultiWordHiddenHandlers = new Dictionary<string, Handler>();

    private static readonly Dictionary<string, string> CommandDescriptions = new()
    {
        { "help", "Zeigt diese Hilfe an" },
        { "infCapDive", "Infinite Capbounces" },
        { "ban", "Ban a player from the server" },
        { "unban", "Unban a player from the server" },
        { "rejoin", "Rejoin players to the server" },
        { "crash", "Crash players on the server" },
        { "send", "Send a Player to a Sage" },
        { "sendall", "Send a scenario to all players" },
        { "scenario", "Merge scenarios (true/false)" },
        { "tag", "" },
        { "maxplayers", "Set maximum Player" },
        { "list", "List connected players" },
        { "flip", "Flip a Player" },
        { "shine", "Shine Sync" },
        { "loadsettings", "Load server settings from file" },
        { "restartserver", "Restart the server" },
        { "exit", "Exit the server application" },
        { "quit", "Quit the server application" },
        { "q", "Quit the server application" }

        // { "deinBefehl", "Beschreibung" },
        // Weitere Kommandos hier ergänzen
    };

    // Usage-Informationen
    private static readonly Dictionary<string, string> CommandUsages = new()
    {
        { "help", "help" },
        { "rejoin", "rejoin <* | !* (usernames to not rejoin...) | (usernames to rejoin...)>" },
        { "crash", "crash <* | !* (usernames to not crash...) | (usernames to crash...)>" },
        { "ban", "ban <Spielername>" },
        { "unban", "unban <Spielername>" },
        { "send", "send <stage> <id> <scenario[-1..127]> <player/*>" },
        { "sendall", "sendall <stage>" },
        { "infCapDive", "infCapDive <Player/*> <true/false>" },
        { "scenario", "scenario merge [true/false]" },
        { "tag", "tag time <user/*> <minutes[0-65535]> <seconds[0-59]>\ntag seeking <user/*> <true/false>\ntag start <time> <seekers>" },
        { "maxplayers", "maxplayers <playercount>" },
        { "list", "list" },
        { "flip", "flip list\nflip add <user id>\nflip remove <user id>\nflip set <true/false>\nflip pov <both/self/others>" },
        { "shine", "shine list\nshine clear\nshine sync\nshine send <id> <player/*>\nshine set <true/false>\nshine include <id>\nshine exclude <id>" },
        { "loadsettings", "loadsettings" },
        { "restartserver", "restartserver" },
        { "exit", "exit" },
        { "quit", "quit" },
        { "q", "q" }
        // ...
    };
    
    public static IEnumerable<(string Name, string? Description, string? Usage)> GetAllCommands()
{
    foreach (var cmd in Handlers.Keys)
    {
        CommandDescriptions.TryGetValue(cmd, out var desc);
        CommandUsages.TryGetValue(cmd, out var usage);
        yield return (cmd, desc, usage);
    }
}

    static CommandHandler()
    {
        RegisterCommand("help", _ =>
        {
            var sb = new StringBuilder();
            sb.AppendLine("Available commands:\n");
            // Passe die Spaltenbreiten an (z.B. 20, 32, 40)
            sb.AppendLine($"{"Commands",-20} | {"Description",-32} | {"Usage",-40}");
            sb.AppendLine(new string('-', 20) + "-|-" + new string('-', 32) + "-|-" + new string('-', 40));
            foreach (var cmd in Handlers.Keys.OrderBy(k => k))
            {
                CommandDescriptions.TryGetValue(cmd, out var desc);
                CommandUsages.TryGetValue(cmd, out var usage);

                desc = string.IsNullOrWhiteSpace(desc) ? "-" : desc;
                usage = string.IsNullOrWhiteSpace(usage) ? "-" : usage;

                var usageLines = usage.Split('\n');
                sb.AppendLine($"{cmd,-20} | {desc.PadRight(32)} | {usageLines[0]}");
                for (int i = 1; i < usageLines.Length; i++)
                    sb.AppendLine($"{new string(' ', 20)} | {new string(' ', 32)} | {usageLines[i]}");
            }
            return sb.ToString();
        });
    }

    public static void RegisterCommand(string name, Handler handler) {
        Handlers[name] = handler;
    }

    public static void RegisterHiddenCommand(string name, Handler handler) {
        HiddenHandlers[name] = handler;
    }

    public static void RegisterMultiWordCommand(string name, Handler handler) {
        MultiWordHandlers[name] = handler;
    }

    public static void RegisterMultiWordHiddenCommand(string name, Handler handler) {
        MultiWordHiddenHandlers[name] = handler;
    }

    public static void RegisterCommandAliases(Handler handler, params string[] names) {
        foreach (string name in names) {
            Handlers.Add(name, handler);
        }
    }



    /// <summary>
    /// Modified by <b>TheUbMunster</b>
    /// </summary>
    public static Response GetResult(string input)
    {
        try
        {
            string[] args = input.Split(' ');
            if (args.Length == 0) return "No command entered, see help command for valid commands";
            //this part is to allow single arguments that contain spaces (since the game seems to be able to handle usernames with spaces, we need to as well)
            List<string> newArgs = new List<string>();
            newArgs.Add(args[0]);
            for (int i = 1; i < args.Length; i++)
            {
                if (args[i].Length == 0) continue; //empty string (>1 whitespace between arguments).
                else if (args[i][0] == '\"')
                {
                    //concatenate args until a string ends with a quote
                    StringBuilder sb = new StringBuilder();
                    i--; //fix off-by-one issue
                    do
                    {
                        i++;
                        sb.Append(args[i] + " "); //add space back removed by the string.Split(' ')
                        if (i >= args.Length)
                        {
                            return "Unmatching quotes, make sure that whenever quotes are used, another quote is present to close it (no action was performed).";
                        }
                    } while (args[i][^1] != '\"');
                    newArgs.Add(sb.ToString(1, sb.Length - 3)); //remove quotes and extra space at the end.
                }
                else
                {
                    newArgs.Add(args[i]);
                }
            }
            args = newArgs.ToArray();
            string commandName = args[0];
            // Check for multi-word commands first
            string fullCommand = string.Join(" ", args);
            foreach (var multiWordHandler in MultiWordHandlers) {
                if (fullCommand.StartsWith(multiWordHandler.Key + " ")) {
                    string[] remainingArgs = fullCommand.Substring(multiWordHandler.Key.Length + 1).Split(' ');
                    return multiWordHandler.Value(remainingArgs);
                }
            }
            foreach (var multiWordHiddenHandler in MultiWordHiddenHandlers) {
                if (fullCommand.StartsWith(multiWordHiddenHandler.Key + " ")) {
                    string[] remainingArgs = fullCommand.Substring(multiWordHiddenHandler.Key.Length + 1).Split(' ');
                    return multiWordHiddenHandler.Value(remainingArgs);
                }
            }
            
            // Then check for single-word commands
            if (Handlers.TryGetValue(commandName, out Handler? handler)) {
                return handler(args[1..]);
            }
            if (HiddenHandlers.TryGetValue(commandName, out Handler? hiddenHandler)) {
                return hiddenHandler(args[1..]);
            }
            
            return $"Invalid command {args[0]}, see help command for valid commands";
        }
        catch (Exception e)
        {
            return $"An error occured while trying to process your command: {e}";
        }
    }

    public class Response {
        public string[] ReturnStrings = null!;
        private Response(){}

        public static implicit operator Response(string value) => new Response {
            ReturnStrings = value.Split('\n')
        };
        public static implicit operator Response(string[] values) => new Response {
            ReturnStrings = values
        };
    }
}