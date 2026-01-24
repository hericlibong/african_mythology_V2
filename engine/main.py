import sys
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from orchestrator import ImageOrchestrator

console = Console()
orchestrator = ImageOrchestrator()

def analyze():
    total, missing = orchestrator.analyze_status()
    
    table = Table(title="L'Esprit - Image Orchestrator Status", border_style="gold1")
    table.add_column("Metric", style="cyan", no_wrap=True)
    table.add_column("Value", style="magenta")
    
    table.add_row("Total Entities", str(total))
    table.add_row("Missing Images", str(missing))
    
    coverage = 0
    if total > 0:
        coverage = ((total-missing)/total)*100
        
    color = "green" if coverage > 80 else "yellow" if coverage > 50 else "red"
    table.add_row("Visual Coverage", f"[{color}]{coverage:.1f}%[/{color}]")
    
    console.print(table)
    
    if missing > 0:
        console.print(f"\n[italic]Run 'python main.py list-missing' to see the full queue.[/italic]")

def list_missing():
    missing = orchestrator.get_missing_images()
    console.print(Panel(f"[bold red]Entities requiring visualization ({len(missing)}):[/bold red]", border_style="red"))
    
    for entity in missing:
        console.print(f"• [bold white]{entity.name}[/bold white] [dim]({entity.entity_type})[/dim]")

def preview(name):
    prompt = orchestrator.get_prompt_preview(name)
    console.print(Panel(f"[bold gold1]Prompt Preview: {name}[/bold gold1]", border_style="gold1"))
    console.print(prompt)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        console.print(Panel("[bold]L'Esprit CLI[/bold]\n\nUsage:\n  python main.py analyze\n  python main.py list-missing\n  python main.py preview <EntityName>", title="Help", border_style="blue"))
        sys.exit(1)
        
    cmd = sys.argv[1]
    
    if cmd == "analyze":
        analyze()
    elif cmd == "list-missing":
        list_missing()
    elif cmd == "preview" and len(sys.argv) > 2:
        preview(sys.argv[2])
    else:
        console.print("[bold red]Unknown command.[/bold red]")
