using Server;
using Shared;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Text.Json;

namespace Server.JsonApi;

public class Context {
    public Server server;
    public Socket? socket;
    public HttpListenerContext? httpContext;
    public ApiRequest? request;
    public Logger? logger;

    // For socket-based context
    public Context(Server server, Socket socket) {
        this.server = server;
        this.socket = socket;
    }

    // For HTTP-based context
    public Context(Server server, HttpListenerContext httpContext) {
        this.server = server;
        this.httpContext = httpContext;
    }

    public bool HasPermission(string perm) {
        if (this.request == null) { return false; }
        return Settings.Instance.JsonApi.Tokens[this.request!.Token!].Contains(perm);
    }

    public SortedSet<string> Permissions {
        get {
            if (this.request == null) { return new SortedSet<string>(); }
            return Settings.Instance.JsonApi.Tokens[this.request!.Token!];
        }
    }

    public async Task Send(object data) {
        byte[] bytes = JsonSerializer.SerializeToUtf8Bytes(data);
        
        if (socket != null) {
            // Handle socket response
            await socket.SendAsync(bytes, SocketFlags.None);
        } else if (httpContext != null) {
            // Handle HTTP response
            httpContext.Response.ContentType = "application/json";
            httpContext.Response.ContentLength64 = bytes.Length;
            await httpContext.Response.OutputStream.WriteAsync(bytes, 0, bytes.Length);
            httpContext.Response.OutputStream.Close();
        } else {
            throw new InvalidOperationException("No valid context available for sending response");
        }
    }
}
