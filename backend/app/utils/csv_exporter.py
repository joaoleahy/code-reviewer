import csv
import io
from typing import List, Dict, Any


class CSVExporter:
    def __init__(self):
        pass
    
    def export_reviews_to_csv(self, reviews: List[Dict[str, Any]]) -> str:
        """
        Export reviews to CSV format
        """
        if not reviews:
            return ""
        
        fieldnames = [
            "id",
            "language",
            "quality_score", 
            "created_at",
            "processing_time",
            "issues_count",
            "suggestions_count",
            "security_concerns_count"
        ]
        
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        
        writer.writeheader()
        
        for review in reviews:
            writer.writerow(review)
        
        csv_content = output.getvalue()
        output.close()
        
        return csv_content
    
    def export_stats_to_csv(self, stats_data: Dict[str, Any]) -> str:
        """
        Export statistics to CSV format
        """
        output = io.StringIO()
        writer = csv.writer(output)
        
        writer.writerow(["Metric", "Value"])
        
        writer.writerow(["Total Reviews", stats_data.get("total_reviews", 0)])
        writer.writerow(["Total Completed", stats_data.get("total_completed", 0)])
        writer.writerow(["Total Failed", stats_data.get("total_failed", 0)])
        writer.writerow(["Average Quality Score", stats_data.get("average_quality_score", 0)])
        writer.writerow(["Average Processing Time", stats_data.get("average_processing_time", 0)])
        
        writer.writerow([])
        
        writer.writerow(["Language Statistics"])
        writer.writerow(["Language", "Count", "Average Score"])
        
        for lang_stat in stats_data.get("language_stats", []):
            writer.writerow([
                lang_stat["language"],
                lang_stat["count"],
                lang_stat["average_score"]
            ])
        
        writer.writerow([])
        
        writer.writerow(["Common Issues"])
        writer.writerow(["Issue", "Count"])
        
        for issue in stats_data.get("common_issues", []):
            writer.writerow([
                issue["issue"],
                issue["count"]
            ])
        
        csv_content = output.getvalue()
        output.close()
        
        return csv_content


csv_exporter = CSVExporter()
