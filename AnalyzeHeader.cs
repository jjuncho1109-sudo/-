using System;
using System.IO;
using System.Text;

public class HeaderAnalyzer {
    public static void Main(string[] args) {
        string f = @"C:\Users\YG_home\Downloads\소상공인시장진흥공단_상가(상권)정보_20260630\소상공인시장진흥공단_상가(상권)정보_경남_202606.csv";
        using (var reader = new StreamReader(f, Encoding.UTF8)) {
            string header = reader.ReadLine();
            var cols = header.Split(',');
            for (int i = 0; i < cols.Length; i++) {
                Console.WriteLine(i + ": " + cols[i].Trim('"'));
            }

            Console.WriteLine("--- SAMPLE JINJU ROWS ---");
            string line;
            int count = 0;
            while ((line = reader.ReadLine()) != null) {
                if (line.Contains("진주시") && (line.Contains("편의점") || line.Contains("GS25") || line.Contains("CU") || line.Contains("약국"))) {
                    Console.WriteLine("SAMPLE " + count + ": " + line.Substring(0, Math.Min(180, line.Length)));
                    count++;
                    if (count >= 5) break;
                }
            }
        }
    }
}
