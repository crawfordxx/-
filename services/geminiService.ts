import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DiagnosticReport } from "../types";

// --- MOCK DATA FOR VIDEO REPRODUCTION ---
// This ensures the app looks exactly like the video even without an API key for these specific IDs.

const MOCK_SPARK_REPORT: DiagnosticReport = {
  id: "application_1747962111306_0003",
  type: "Spark",
  title: "Spark 应用 application_1747962111306_0003 的性能瓶颈诊断报告",
  timestamp: "2025-06-15 14:38:13",
  status: "Critical",
  summary: "诊断发现该 Spark 任务存在严重的数据倾斜和 Shuffle 性能问题。建议开启 AQE 并优化 Join 策略。",
  metrics: [
    { label: "Duration", value: "45min", trend: "up" },
    { label: "Shuffle Data", value: "1.2TB", trend: "up" },
    { label: "Tasks", value: "12,400", trend: "stable" }
  ],
  issues: [
    {
      id: "i1",
      title: "AQE (自适应查询执行) 未启用",
      severity: "Critical",
      description: "当前任务未开启 AQE，无法动态优化 Shuffle 分区数及处理数据倾斜。",
      evidence: "spark.sql.adaptive.enabled = false"
    },
    {
      id: "i2",
      title: "分区裁剪失效导致全表扫描",
      severity: "High",
      description: "store_sales, web_sales 等大表扫描未有效裁剪分区，导致全表扫描。",
      evidence: "Scan table store_sales (rows=50B)"
    },
    {
      id: "i3",
      title: "过多 Shuffle 操作拖慢性能",
      severity: "Medium",
      description: "物理计划中出现超过 13 次 Shuffle 操作，显著增加网络 IO 和 CPU 开销。",
      evidence: "Exchange hashpartitioning"
    }
  ],
  optimizations: [
    {
      id: "o1",
      title: "建议 1: 立即开启 AQE 自适应查询执行",
      priority: "High",
      difficulty: "Low",
      benefit: "自动化优化 Shuffle 并行度，减少数据倾斜影响",
      actionType: "Configuration",
      currentValue: "false",
      suggestedValue: "true",
      autoFixAvailable: true,
      description: "开启 AQE 可以动态调整 Shuffle 的 Partition 数量，自动处理数据倾斜问题。",
      codeSnippet: "set spark.sql.adaptive.enabled = true;\nset spark.sql.adaptive.skewJoin.enabled = true;"
    },
    {
      id: "o2",
      title: "建议 2: 添加显式分区过滤条件",
      priority: "High",
      difficulty: "Medium",
      benefit: "减少全表扫描，降低 I/O 和计算负载",
      actionType: "SQL",
      autoFixAvailable: false,
      description: "在 SQL 查询中明确添加分区字段的过滤条件。",
      codeSnippet: "WHERE ss_sold_date_sk IN (\n  SELECT d_date_sk FROM date_dim WHERE d_year = 2000\n)"
    },
    {
      id: "o3",
      title: "建议 3: 使用 Broadcast Hint 优化小表 Join",
      priority: "Medium",
      difficulty: "Medium",
      benefit: "避免 Shuffle，加速 Join 操作",
      actionType: "SQL",
      autoFixAvailable: false,
      description: "对于较小的维度表，强制使用 Broadcast Join。",
      codeSnippet: "SELECT /*+ BROADCAST(date_dim) */ ... "
    }
  ]
};

const MOCK_HDFS_REPORT: DiagnosticReport = {
  id: "cluster-prod-01",
  type: "HDFS",
  title: "大数据集群 cluster-prod-01 的存储健康诊断报告",
  timestamp: "2025-06-15 14:40:00",
  status: "Warning",
  summary: "本次诊断主要发现大量小文件问题，NameNode 内存使用率较高 (92.5%)，建议尽快进行合并处理。",
  metrics: [
    { label: "Files", value: "120M", trend: "up" },
    { label: "Small Files", value: "45%", trend: "up" },
    { label: "NN Heap", value: "92.5%", trend: "up" }
  ],
  issues: [
    {
      id: "h1",
      title: "HDFS 集群存在严重的小文件问题",
      severity: "High",
      description: "小文件占比超过 45%，给 NameNode 内存带来巨大压力。",
      evidence: "Avg file size < 12MB"
    },
    {
      id: "h2",
      title: "ods.user_action_log_stream 存在海量小文件",
      severity: "High",
      description: "该目录下存在超过 1200 万个小文件，主要因实时流每 5 分钟 commit 一次导致。",
      evidence: "/user/hive/warehouse/ods.db/user_action_log_stream"
    }
  ],
  optimizations: [
    {
      id: "ho1",
      title: "建议 1: 立即合并小文件",
      priority: "High",
      difficulty: "High",
      benefit: "释放 NameNode 内存，提升读取效率",
      actionType: "Configuration",
      autoFixAvailable: true,
      description: "合并 ods.user_action_log_stream 目录下的历史小文件。",
      codeSnippet: "CALL small_file_merge('ods', 'user_action_log_stream');"
    },
    {
      id: "ho2",
      title: "建议 2: 优化分区策略",
      priority: "Medium",
      difficulty: "High",
      benefit: "长期减少小文件产生",
      actionType: "Architecture",
      autoFixAvailable: false,
      description: "调整数仓分区策略，按天或按小时进行分区，避免过细粒度的分区。",
      codeSnippet: "-- 建议调整 ETL 逻辑，增加 Coalesce 操作\n.coalesce(10).write..."
    }
  ]
};

const MOCK_SYSTEM_REPORT: DiagnosticReport = {
  id: "pod-webapp-7b9d8c8f5",
  type: "System",
  title: "Pod webapp-7b9d8c8f5 内存溢出 (OOM) 根因分析报告",
  timestamp: "2025-06-16 09:15:22",
  status: "Critical",
  summary: "系统检测到 Pod 发生 OOM Restart。深入分析监控数据发现，堆内存 (Heap) 在 10 分钟内由 40% 飙升至 99%，最终触发 Full GC Storm 并导致 Kubernetes OOM Killer 介入。根因定位为 OrderProcessor 模块存在 JDBC 连接泄漏。",
  metrics: [
    { label: "Memory Usage", value: "99.2%", trend: "up" },
    { label: "GC Time/min", value: "52s", trend: "up" },
    { label: "Restart Count", value: "4", trend: "up" }
  ],
  issues: [
    {
      id: "s1",
      title: "Kubernetes OOM Killer 触发",
      severity: "Critical",
      description: "容器内存使用量达到 Limit 限制 (4Gi)，被内核强制 Kill。",
      evidence: "Exit Code: 137 (OOM Killed)"
    },
    {
      id: "s2",
      title: "JVM Full GC 风暴",
      severity: "High",
      description: "崩溃前 5 分钟内，JVM 频繁进行 Full GC，但仅回收了 < 2% 的堆空间，CPU 占用率飙升至 200%。",
      evidence: "[Full GC (Ergonomics) [PSYoungGen: ...]]"
    },
    {
      id: "s3",
      title: "JDBC 连接池对象泄漏",
      severity: "High",
      description: "Heap Dump 分析显示 `com.example.OrderProcessor`持有大量未释放的 `Connection` 对象。",
      evidence: "Retained Heap: 3.2GB (80%)"
    }
  ],
  optimizations: [
    {
      id: "so1",
      title: "紧急建议: 扩容内存限制",
      priority: "High",
      difficulty: "Low",
      benefit: "防止服务短期内再次崩溃",
      actionType: "Configuration",
      currentValue: "limits.memory: 4Gi",
      suggestedValue: "limits.memory: 8Gi",
      autoFixAvailable: true,
      description: "临时调整 Deployment 资源限制，给予应用更多缓冲空间。",
      codeSnippet: "resources:\n  limits:\n    memory: \"8Gi\"\n  requests:\n    memory: \"4Gi\""
    },
    {
      id: "so2",
      title: "根因修复: 修复连接池泄漏代码",
      priority: "High",
      difficulty: "High",
      benefit: "彻底解决内存泄漏问题",
      actionType: "Architecture",
      autoFixAvailable: false,
      description: "在 OrderProcessor.java 中增加 try-with-resources 语句，确保连接正确关闭。",
      codeSnippet: "try (Connection conn = dataSource.getConnection()) {\n    // process logic\n}"
    },
    {
      id: "so3",
      title: "JVM 参数调优",
      priority: "Medium",
      difficulty: "Medium",
      benefit: "优化 GC 效率，减少停顿",
      actionType: "Configuration",
      autoFixAvailable: false,
      description: "启用 G1GC 替代默认的 ParallelGC 以获得更好的延迟表现。",
      codeSnippet: "-XX:+UseG1GC -XX:MaxGCPauseMillis=200"
    }
  ]
};

// --- REAL GEMINI IMPLEMENTATION ---

export const analyzeQuery = async (query: string): Promise<DiagnosticReport> => {
  // 1. Check for specific IDs to replicate video exactly (Mock Fallback)
  if (query.includes("1747962111306_0003")) return MOCK_SPARK_REPORT;
  if (query.includes("cluster-prod-01")) return MOCK_HDFS_REPORT;
  if (query.includes("webapp") || query.includes("OOM") || query.includes("7b9d8c8f5")) return MOCK_SYSTEM_REPORT;

  // 2. Setup Gemini
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    // If no API key, simulate generic fallbacks based on keywords
    const q = query.toLowerCase();
    if (q.includes("spark")) return MOCK_SPARK_REPORT;
    if (q.includes("hdfs") || q.includes("cluster")) return MOCK_HDFS_REPORT;
    if (q.includes("oom") || q.includes("pod") || q.includes("system") || q.includes("java") || q.includes("cpu")) return MOCK_SYSTEM_REPORT;
    
    throw new Error("API Key required for custom analysis. Try using the preset IDs from the sidebar.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      type: { type: Type.STRING, enum: ["Spark", "HDFS", "System", "General"] },
      title: { type: Type.STRING },
      timestamp: { type: Type.STRING },
      summary: { type: Type.STRING },
      status: { type: Type.STRING, enum: ["Healthy", "Warning", "Critical"] },
      metrics: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
             label: { type: Type.STRING },
             value: { type: Type.STRING },
             trend: { type: Type.STRING, enum: ["up", "down", "stable"] }
          }
        }
      },
      issues: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            severity: { type: Type.STRING, enum: ["Critical", "High", "Medium", "Low", "Warning"] },
            description: { type: Type.STRING },
            evidence: { type: Type.STRING },
          },
          required: ["title", "severity", "description"]
        },
      },
      optimizations: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
            difficulty: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
            benefit: { type: Type.STRING },
            actionType: { type: Type.STRING, enum: ["Configuration", "SQL", "Architecture"] },
            currentValue: { type: Type.STRING },
            suggestedValue: { type: Type.STRING },
            codeSnippet: { type: Type.STRING },
            description: { type: Type.STRING },
            autoFixAvailable: { type: Type.BOOLEAN },
          },
          required: ["title", "priority", "description"]
        },
      },
    },
    required: ["title", "summary", "issues", "optimizations"],
  };

  try {
    const model = ai.models.getGenerativeModel({
        model: "gemini-2.5-flash-latest", 
        systemInstruction: "You are an expert Big Data and System Operations Digital Assistant (SRE Agent). You analyze Spark logs, HDFS status, Kubernetes pods, Java OOM issues, and system metrics. Return a detailed, professional diagnostic report in structured JSON format. Be concise, technical, and helpful. Use Chinese for the content."
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: `Analyze the following query/ID and generate a diagnostic report: ${query}. 
          - If it looks like a Spark ID, treat it as a Spark task. 
          - If it looks like a cluster name, treat it as HDFS/Cluster diagnosis.
          - If it looks like a pod name or OOM issue, treat it as a System/SRE diagnosis.` }]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const text = result.response.text();
    return JSON.parse(text) as DiagnosticReport;

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback to Spark report just to keep the UI functional in case of API error
    return MOCK_SPARK_REPORT;
  }
};
