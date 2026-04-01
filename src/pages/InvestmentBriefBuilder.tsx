import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, FileDown, FileText, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { exportBrief, downloadTemplate, type BriefFormData } from "@/lib/exportInvestmentBrief";
import { useToast } from "@/hooks/use-toast";

const INVESTMENT_TYPES = ["R&D", "Hiring", "Marketing", "Capex", "Partnership", "Other"];
const RETURN_TYPES = ["Revenue Uplift", "Cost Reduction", "Risk Mitigation", "Time Saved", "Other"];

const emptyRoi = () => ({ lineItem: "", returnAmt: "", cost: "", paybackPeriod: "" });
const emptySuccess = () => ({ metric: "", baseline: "", target: "", reviewDate: "", owner: "" });

const fmtCurrency = (val: string) => {
  const n = parseFloat(val);
  if (isNaN(n)) return "";
  return n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function InvestmentBriefBuilder() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [company, setCompany] = useState("");
  const [owner, setOwner] = useState("");
  const [date, setDate] = useState("");
  const [investmentType, setInvestmentType] = useState("");
  const [investmentTypeOther, setInvestmentTypeOther] = useState("");
  const [totalAsk, setTotalAsk] = useState("");
  const [problem, setProblem] = useState("");
  const [inScope, setInScope] = useState("");
  const [outOfScope, setOutOfScope] = useState("");
  const [roiRows, setRoiRows] = useState([emptyRoi()]);
  const [returnTypes, setReturnTypes] = useState<string[]>([]);
  const [returnTypeOther, setReturnTypeOther] = useState("");
  const [keyAssumptions, setKeyAssumptions] = useState("");
  const [successRows, setSuccessRows] = useState([emptySuccess()]);

  const toggleReturnType = (rt: string) => {
    setReturnTypes(prev => prev.includes(rt) ? prev.filter(t => t !== rt) : [...prev, rt]);
  };

  const updateRoi = (i: number, field: string, val: string) => {
    setRoiRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  };
  const removeRoi = (i: number) => setRoiRows(prev => prev.filter((_, idx) => idx !== i));

  const updateSuccess = (i: number, field: string, val: string) => {
    setSuccessRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  };
  const removeSuccess = (i: number) => setSuccessRows(prev => prev.filter((_, idx) => idx !== i));

  const handleExport = async () => {
    const allReturnTypes = returnTypes.includes("Other") && returnTypeOther.trim()
      ? [...returnTypes.filter(r => r !== "Other"), returnTypeOther.trim()]
      : returnTypes;
    const data: BriefFormData = {
      company, owner, date, investmentType, investmentTypeOther,
      totalAsk, problem, inScope, outOfScope, roiRows, returnTypes: allReturnTypes,
      keyAssumptions, successRows,
    };
    await exportBrief(data);
    toast({ title: "Proposal exported", description: "Your .docx file has been downloaded." });
  };

  const handleDownloadTemplate = async () => {
    await downloadTemplate();
    toast({ title: "Template downloaded", description: "Blank template .docx has been downloaded." });
  };

  const fmtMultiple = (ret: string, cost: string) => {
    const r = parseFloat(ret) || 0;
    const c = parseFloat(cost) || 0;
    return c > 0 ? `${(r / c).toFixed(1)}x` : "—";
  };

  const sectionClass = "border-t border-gray-100 pt-6 mt-6";

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/portal")}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Portal
          </button>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              className="text-xs"
              disabled
            >
              <FileText className="w-3.5 h-3.5 mr-1" /> Fill & Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="text-xs"
            >
              <FileDown className="w-3.5 h-3.5 mr-1" /> Download Template
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Project Proposal Template</h1>
        <p className="text-sm text-gray-500 mb-8 max-w-2xl leading-relaxed">
          All company investments should be tied to hypotheses on the impact to the business. We highly recommend instituting some sort of project proposal framework to manage investments and track outcomes.
        </p>

        {/* Header fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <Label className="text-xs text-gray-500">Company</Label>
            <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme Corp" />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Owner</Label>
            <Input value={owner} onChange={e => setOwner(e.target.value)} placeholder="Jane Doe" />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Date</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
          <div>
            <Label className="text-xs text-gray-500">Investment Type</Label>
            <Select value={investmentType} onValueChange={setInvestmentType}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                {INVESTMENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {investmentType === "Other" && (
            <div>
              <Label className="text-xs text-gray-500">Specify</Label>
              <Input value={investmentTypeOther} onChange={e => setInvestmentTypeOther(e.target.value)} placeholder="Describe" />
            </div>
          )}
          <div>
            <Label className="text-xs text-gray-500">Total Investment Ask (C$)</Label>
            <Input
              value={totalAsk}
              onChange={e => setTotalAsk(e.target.value)}
              onBlur={() => { if (totalAsk) setTotalAsk(fmtCurrency(totalAsk.replace(/,/g, ""))); }}
              placeholder="250,000.00"
            />
          </div>
        </div>

        {/* Section 1 */}
        <div className={sectionClass}>
          <h2 className="text-base font-semibold text-gray-800 mb-3">1. The Problem</h2>
          <Textarea
            value={problem}
            onChange={e => setProblem(e.target.value)}
            placeholder="What's broken or underperforming? What does inaction cost you? Use numbers where possible."
            className="min-h-[100px]"
          />
        </div>

        {/* Section 2 */}
        <div className={sectionClass}>
          <h2 className="text-base font-semibold text-gray-800 mb-3">2. The Investment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-500">In Scope</Label>
              <Textarea value={inScope} onChange={e => setInScope(e.target.value)} placeholder="What this investment covers" className="min-h-[100px]" />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Out of Scope</Label>
              <Textarea value={outOfScope} onChange={e => setOutOfScope(e.target.value)} placeholder="What this investment does not cover" className="min-h-[100px]" />
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className={sectionClass}>
          <h2 className="text-base font-semibold text-gray-800 mb-3">3. ROI Model</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600">
                  <th className="text-left p-2 font-medium border border-gray-200">Line Item</th>
                  <th className="text-left p-2 font-medium border border-gray-200">Return (C$)</th>
                  <th className="text-left p-2 font-medium border border-gray-200">Cost (C$)</th>
                  <th className="text-left p-2 font-medium border border-gray-200">Multiple</th>
                  <th className="text-left p-2 font-medium border border-gray-200">Payback Period</th>
                  <th className="w-10 border border-gray-200"></th>
                </tr>
              </thead>
              <tbody>
                {roiRows.map((row, i) => (
                  <tr key={i}>
                    <td className="p-1 border border-gray-200">
                      <Input value={row.lineItem} onChange={e => updateRoi(i, "lineItem", e.target.value)} className="border-0 h-8 text-sm" placeholder="e.g. New SDR team" />
                    </td>
                    <td className="p-1 border border-gray-200">
                      <Input
                        type="number"
                        step="0.01"
                        value={row.returnAmt}
                        onChange={e => updateRoi(i, "returnAmt", e.target.value)}
                        className="border-0 h-8 text-sm"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="p-1 border border-gray-200">
                      <Input
                        type="number"
                        step="0.01"
                        value={row.cost}
                        onChange={e => updateRoi(i, "cost", e.target.value)}
                        className="border-0 h-8 text-sm"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="p-1 border border-gray-200 text-center font-medium text-gray-700">
                      {fmtMultiple(row.returnAmt, row.cost)}
                    </td>
                    <td className="p-1 border border-gray-200">
                      <Input value={row.paybackPeriod} onChange={e => updateRoi(i, "paybackPeriod", e.target.value)} className="border-0 h-8 text-sm" placeholder="e.g. 6 months" />
                    </td>
                    <td className="p-1 border border-gray-200 text-center">
                      {roiRows.length > 1 && (
                        <button onClick={() => removeRoi(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button variant="outline" size="sm" onClick={() => setRoiRows(prev => [...prev, emptyRoi()])} className="mt-2 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Row
          </Button>

          <div className="mt-5">
            <Label className="text-xs text-gray-500 mb-2 block">Return Type</Label>
            <div className="flex flex-wrap gap-3">
              {RETURN_TYPES.map(rt => (
                <label key={rt} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                  <Checkbox checked={returnTypes.includes(rt)} onCheckedChange={() => toggleReturnType(rt)} />
                  {rt}
                </label>
              ))}
            </div>
            {returnTypes.includes("Other") && (
              <div className="mt-2">
                <Input
                  value={returnTypeOther}
                  onChange={e => setReturnTypeOther(e.target.value)}
                  placeholder="Specify return type"
                  className="max-w-xs text-sm"
                />
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Revenue uplift = incremental ARR or conversion lift. Cost reduction = vendor or headcount savings. Risk mitigation = churn or compliance cost avoided. Time saved = hours × fully-loaded cost rate.
            </p>
          </div>

          <div className="mt-4">
            <Label className="text-xs text-gray-500">Key Assumptions</Label>
            <Textarea value={keyAssumptions} onChange={e => setKeyAssumptions(e.target.value)} placeholder="List the core assumptions underpinning your ROI model" className="min-h-[80px]" />
          </div>
        </div>

        {/* Section 4 — Success Metrics */}
        <div className={sectionClass}>
          <h2 className="text-base font-semibold text-gray-800 mb-3">4. Success Metrics</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600">
                  <th className="text-left p-2 font-medium border border-gray-200">Metric</th>
                  <th className="text-left p-2 font-medium border border-gray-200">Baseline</th>
                  <th className="text-left p-2 font-medium border border-gray-200">Target</th>
                  <th className="text-left p-2 font-medium border border-gray-200">Review Date</th>
                  <th className="text-left p-2 font-medium border border-gray-200">Owner</th>
                  <th className="w-10 border border-gray-200"></th>
                </tr>
              </thead>
              <tbody>
                {successRows.map((row, i) => (
                  <tr key={i}>
                    <td className="p-1 border border-gray-200">
                      <Input value={row.metric} onChange={e => updateSuccess(i, "metric", e.target.value)} className="border-0 h-8 text-sm" placeholder="e.g. Pipeline generated" />
                    </td>
                    <td className="p-1 border border-gray-200">
                      <Input value={row.baseline} onChange={e => updateSuccess(i, "baseline", e.target.value)} className="border-0 h-8 text-sm" placeholder="Current" />
                    </td>
                    <td className="p-1 border border-gray-200">
                      <Input value={row.target} onChange={e => updateSuccess(i, "target", e.target.value)} className="border-0 h-8 text-sm" placeholder="Goal" />
                    </td>
                    <td className="p-1 border border-gray-200">
                      <Input type="date" value={row.reviewDate} onChange={e => updateSuccess(i, "reviewDate", e.target.value)} className="border-0 h-8 text-sm" />
                    </td>
                    <td className="p-1 border border-gray-200">
                      <Input value={row.owner} onChange={e => updateSuccess(i, "owner", e.target.value)} className="border-0 h-8 text-sm" placeholder="Name" />
                    </td>
                    <td className="p-1 border border-gray-200 text-center">
                      {successRows.length > 1 && (
                        <button onClick={() => removeSuccess(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button variant="outline" size="sm" onClick={() => setSuccessRows(prev => [...prev, emptySuccess()])} className="mt-2 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Row
          </Button>
        </div>

        {/* Export */}
        <div className="mt-10 mb-16 flex justify-end">
          <Button onClick={handleExport} size="lg">
            <FileDown className="w-4 h-4 mr-2" /> Export to Word
          </Button>
        </div>
      </div>
    </div>
  );
}
