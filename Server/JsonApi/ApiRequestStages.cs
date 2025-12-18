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
                
                // Verwende den Alias als Key statt dem Kingdom
                if (!stagesByKingdom.ContainsKey(alias)) {
                    stagesByKingdom[alias] = new List<string>();
                }
                stagesByKingdom[alias].Add(stage);
                
                // Erstelle stageToKingdom Mapping (hier ist Kingdom der Alias)
                stageToKingdom[stage] = alias;
                
                // Hole das echte Kingdom für kingdomToStage
                if (Shared.Stages.Alias2Kingdom.Contains(alias)) {
                    var kingdom = Shared.Stages.Alias2Kingdom[alias]?.ToString();
                    if (!string.IsNullOrEmpty(kingdom)) {
                        // Erstelle kingdomToStage Mapping für Home Stages
                        if (stage.Contains("HomeStage")) {
                            kingdomToStage[alias] = stage;
                        }
                        
                        // Erstelle mapImages basierend auf dem echten Kingdom
                        var kingdomName = kingdom.Replace(" ", "");
                        mapImages[stage] = $"{kingdomName}.png";
                    }
                }
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
            
            string endpoint = ctx.socket?.RemoteEndPoint?.ToString() ?? ctx.httpContext?.Request.RemoteEndPoint?.ToString() ?? "unknown";
            JsonApi.Logger.Info($"Stages API request from {endpoint}");
            return true;
            
        } catch (Exception ex) {
            JsonApi.Logger.Error($"Error in Stages API: {ex.Message}");
            return false;
        }
    }
} 