using System.Text;

namespace Shared;

public class Logger {
    private readonly List<string> outputBuffer = new();
    private readonly object bufferLock = new();
    private static readonly List<string> globalOutputBuffer = new();
    private static readonly object globalBufferLock = new();

    public Logger(string name) {
        Name = name;
    }

    public string Name { get; set; }

    public void Info(string text) => WriteAndHandle("Info", text, ConsoleColor.White);

    public void Warn(string text) => WriteAndHandle("Warn", text, ConsoleColor.Yellow);

    public void Error(string text) => WriteAndHandle("Error", text, ConsoleColor.Red);

    public void Error(Exception error) => Error(error.ToString());

    private void WriteAndHandle(string level, string text, ConsoleColor color)
    {
        lock (bufferLock)
        {
            foreach (var line in text.Split('\n'))
            {
                outputBuffer.Add($"[{DateTime.Now}] {level} [{Name}] {line}");
                if (outputBuffer.Count > 10000)
                    outputBuffer.RemoveAt(0);
            }
        }

        // Also append to global buffer
        lock (globalBufferLock)
        {
            foreach (var line in text.Split('\n'))
            {
                globalOutputBuffer.Add($"[{DateTime.Now}] {level} [{Name}] {line}");
                if (globalOutputBuffer.Count > 10000)
                    globalOutputBuffer.RemoveAt(0);
            }
        }
        Handler?.Invoke(Name, level, text, color);
    }

    public string GetOutput()
    {
        lock (bufferLock)
        {
            return string.Join(Environment.NewLine, outputBuffer);
        }
    }

    public static string PrefixNewLines(string text, string prefix) {
        StringBuilder builder = new StringBuilder();
        foreach (string str in text.Split('\n'))
            builder
                .Append(prefix)
                .Append(' ')
                .AppendLine(str);
        return builder.ToString();
    }

    public static string GetGlobalOutput()
    {
        lock (globalBufferLock)
        {
            return string.Join(Environment.NewLine, globalOutputBuffer);
        }
    }

    public delegate void LogHandler(string source, string level, string text, ConsoleColor color);

    private static LogHandler? Handler;
    public static void AddLogHandler(LogHandler handler) => Handler += handler;

    static Logger() {
        AddLogHandler((source, level, text, color) => {
            DateTime logtime = DateTime.Now;
            Console.ForegroundColor = color;
            Console.Write(PrefixNewLines(text, $"{{{logtime}}} {level} [{source}]"));
        });
    }
}