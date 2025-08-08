using System.Text.Json;
using System.Text.Json.Nodes;

namespace Server.JsonApi;

public class ApiRequestStages {
    public static async Task<bool> Send(Context ctx) {
        try {
            // Erstelle die Stage-Daten aus der Stages-Klasse
            var stagesByKingdom = new Dictionary<string, List<string>>();
            var stageToKingdom = new Dictionary<string, string>();
            var kingdomToStage = new Dictionary<string, string>();
            var mapImages = new Dictionary<string, string>();

            // Erstelle stagesByKingdom aus Stage2Alias und Alias2Kingdom
            foreach (var stageEntry in Shared.Stages.Stage2Alias) {
                var stage = stageEntry.Key;
                var alias = stageEntry.Value;
                
                // Verwende ContainsKey und Indexer für OrderedDictionary
                if (Shared.Stages.Alias2Kingdom.Contains(alias)) {
                    var kingdom = Shared.Stages.Alias2Kingdom[alias]?.ToString();
                    if (!string.IsNullOrEmpty(kingdom)) {
                        if (!stagesByKingdom.ContainsKey(kingdom)) {
                            stagesByKingdom[kingdom] = new List<string>();
                        }
                        stagesByKingdom[kingdom].Add(stage);
                        
                        // Erstelle stageToKingdom Mapping
                        stageToKingdom[stage] = kingdom;
                        
                        // Erstelle kingdomToStage Mapping für Home Stages
                        if (stage.Contains("HomeStage")) {
                            kingdomToStage[kingdom] = stage;
                        }
                    }
                }
            }

            // Erstelle mapImages basierend auf kingdomToStage
            foreach (var entry in kingdomToStage) {
                var kingdom = entry.Key;
                var homeStage = entry.Value;
                var kingdomName = kingdom.Replace(" ", "");
                mapImages[homeStage] = $"{kingdomName}.png";
            }

            // Erstelle JSON-Response
            var response = new {
                stagesByKingdom,
                stageToKingdom,
                kingdomToStage,
                mapImages
            };

            // Sende Response über die Send-Methode
            await ctx.Send(response);
            
            JsonApi.Logger.Info($"Stages API request from {ctx.socket.RemoteEndPoint}");
            return true;
            
        } catch (Exception ex) {
            JsonApi.Logger.Error($"Error in Stages API: {ex.Message}");
            return false;
        }
    }
} 