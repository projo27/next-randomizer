import { promises as fs } from 'fs';
import path from 'path';
import { Header } from "@/components/header";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

async function getMarkdownContent() {
  const filePath = path.join(process.cwd(), 'src', 'content', 'tutorial.md');
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error("Could not read tutorial file:", error);
    return "## Tutorial Not Found\n\nWe couldn't find the tutorial content. Please check back later.";
  }
}

export default async function TutorialPage() {
    const markdown = await getMarkdownContent();
    return (
        <div className="flex flex-col items-center justify-start min-h-screen p-4 md:p-8 pt-12 md:pt-16">
            <Header />
            <main className="w-full max-w-4xl mx-auto mt-6 bg-card text-card-foreground p-6 md:p-10 rounded-lg shadow-md prose dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
            </main>
        </div>
    );
}
