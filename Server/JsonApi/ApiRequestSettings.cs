using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Net;
using Server;

namespace Server.JsonApi;

public class ApiRequestSettings {
    public static async Task<bool> Send(Context ctx) {
        try {
            // Create response with only the necessary settings
            var response = new {
                username = Settings.Instance.WebInterface.Username,
                password = Settings.Instance.WebInterface.Password
            };

            // Convert the response to JSON
            string jsonResponse = JsonSerializer.Serialize(response);
            
            // Use the Context's Send method which now handles both HTTP and socket responses
            await ctx.Send(response);
            
            return true;
        } catch (Exception ex) {
            ctx.server?.Logger?.Error($"Error in ApiRequestSettings: {ex}");
            return false;
        }
    }
}
