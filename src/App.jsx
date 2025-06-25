import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import logo from "@/assets/53066cfa-1d10-4468-af54-dc55d27eead2.png";

export default function GymnasticsFeeCalculator() {
  const [judges, setJudges] = useState([
    {
      name: '',
      level: 'FIG',
      compulsoryRoutines: 0,
      optionalRoutines: 0,
      sessionRate: 0,
      meetRate: 0,
      mileage: 0,
      mileageRate: 0,
      figFee: 0,
      nationalFee: 0,
      compulsoryFee: 0,
    },
  ]);

  const [results, setResults] = useState([]);

  const handleJudgeChange = (index, e) => {
    const { name, value } = e.target;
    const newJudges = [...judges];
    newJudges[index][name] = name.includes("Routines") ? parseInt(value) || 0 : parseFloat(value) || value;
    setJudges(newJudges);
  };

  const addJudge = () => {
    setJudges([
      ...judges,
      {
        name: '',
        level: 'FIG',
        compulsoryRoutines: 0,
        optionalRoutines: 0,
        sessionRate: 0,
        meetRate: 0,
        mileage: 0,
        mileageRate: 0,
        figFee: 0,
        nationalFee: 0,
        compulsoryFee: 0,
      },
    ]);
  };

  useEffect(() => {
    const newResults = judges.map((judge) => {
      const compulsoryTotal = judge.compulsoryRoutines * judge.compulsoryFee;
      const optionalTotal =
        judge.level === 'FIG'
          ? judge.optionalRoutines * judge.figFee
          : judge.level === 'National'
          ? judge.optionalRoutines * judge.nationalFee
          : 0;
      const mileageTotal = judge.mileage * judge.mileageRate;
      const total = compulsoryTotal + optionalTotal + judge.sessionRate + judge.meetRate + mileageTotal;
      return { ...judge, compulsoryTotal, optionalTotal, mileageTotal, total };
    });
    setResults(newResults);
  }, [judges]);

  const exportPDF = () => {
    const doc = new jsPDF();

    const img = new Image();
    img.src = logo;
    doc.addImage(img, 'PNG', 10, 10, 50, 20);

    doc.setFontSize(14);
    doc.text("Gymnastics Judge Fee Summary", 70, 20);

    let y = 40;
    results.forEach((res, i) => {
      doc.text(`Judge ${i + 1}: ${res.name} (${res.level})`, 10, y);
      y += 6;
      doc.text(`Compulsory Total: $${res.compulsoryTotal.toFixed(2)}`, 10, y);
      y += 6;
      doc.text(`Optional Total: $${res.optionalTotal.toFixed(2)}`, 10, y);
      y += 6;
      doc.text(`Meal Penalties: $${res.sessionRate.toFixed(2)}`, 10, y);
      y += 6;
      doc.text(`Head Judge: $${res.meetRate.toFixed(2)}`, 10, y);
      y += 6;
      doc.text(`Miles Driven: ${res.mileage} @ $${res.mileageRate.toFixed(2)} = $${res.mileageTotal.toFixed(2)}`, 10, y);
      y += 6;
      doc.text(`Total Pay: $${res.total.toFixed(2)}`, 10, y);
      y += 10;
    });

    doc.save("judging_fees.pdf");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto text-blue-900">
      <div className="flex justify-center mb-4">
        <img src={logo} alt="NGJA Logo" className="h-16" />
      </div>
      <h1 className="text-3xl font-bold mb-6 text-center text-red-600">Men's Gymnastics Judge Fee Calculator</h1>
      {judges.map((judge, index) => (
        <Card key={index} className="mb-6 border-blue-200 shadow-lg">
          <CardContent className="space-y-6">
            <h2 className="text-xl font-semibold text-blue-800 border-b pb-2">Judge #{index + 1}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Judge Name</label>
                <Input
                  name="name"
                  placeholder="Judge Name"
                  value={judge.name}
                  onChange={(e) => handleJudgeChange(index, e)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Certification Level</label>
                <select
                  name="level"
                  value={judge.level}
                  onChange={(e) => handleJudgeChange(index, e)}
                  className="border p-2 rounded w-full"
                >
                  <option value="FIG">FIG</option>
                  <option value="National">National</option>
                  <option value="Compulsory">Compulsory</option>
                </select>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-blue-700 mt-4">Routine Counts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Optional Routines</label>
                <Input
                  name="optionalRoutines"
                  type="number"
                  value={judge.optionalRoutines}
                  onChange={(e) => handleJudgeChange(index, e)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Compulsory Routines</label>
                <Input
                  name="compulsoryRoutines"
                  type="number"
                  value={judge.compulsoryRoutines}
                  onChange={(e) => handleJudgeChange(index, e)}
                />
              </div>
            </div>

            <h3 className="text-lg font-semibold text-blue-700 mt-4">Per Routine Fees</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {judge.level === 'FIG' && (
                <div>
                  <label className="block text-sm font-medium mb-1">FIG Optional Fee</label>
                  <Input
                    name="figFee"
                    type="number"
                    value={judge.figFee}
                    onChange={(e) => handleJudgeChange(index, e)}
                  />
                </div>
              )}
              {judge.level === 'National' && (
                <div>
                  <label className="block text-sm font-medium mb-1">National Optional Fee</label>
                  <Input
                    name="nationalFee"
                    type="number"
                    value={judge.nationalFee}
                    onChange={(e) => handleJudgeChange(index, e)}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Compulsory Fee</label>
                <Input
                  name="compulsoryFee"
                  type="number"
                  value={judge.compulsoryFee}
                  onChange={(e) => handleJudgeChange(index, e)}
                />
              </div>
            </div>

            <h3 className="text-lg font-semibold text-blue-700 mt-4">Flat Rates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Meal Penalties</label>
                <Input
                  name="sessionRate"
                  type="number"
                  value={judge.sessionRate}
                  onChange={(e) => handleJudgeChange(index, e)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Head Judge</label>
                <Input
                  name="meetRate"
                  type="number"
                  value={judge.meetRate}
                  onChange={(e) => handleJudgeChange(index, e)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Miles Driven</label>
                <Input
                  name="mileage"
                  type="number"
                  value={judge.mileage}
                  onChange={(e) => handleJudgeChange(index, e)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mileage Rate</label>
                <Input
                  name="mileageRate"
                  type="number"
                  value={judge.mileageRate}
                  onChange={(e) => handleJudgeChange(index, e)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex flex-wrap gap-4 mb-6 justify-center">
        <Button className="bg-red-600 text-white hover:bg-red-700" onClick={addJudge}>Add Judge</Button>
        <Button className="bg-white border text-blue-700 hover:bg-blue-100 flex items-center gap-2" onClick={exportPDF}>
          <Download size={16} /> Export PDF
        </Button>
      </div>

      {results.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-blue-900">Calculated Results</h2>
          <div className="space-y-4">
            {results.map((res, i) => (
              <Card key={i} className="border border-blue-300">
                <CardContent className="py-4 px-6">
                  <h3 className="text-xl font-semibold text-blue-800 mb-2">{res.name} ({res.level})</h3>
                  <p>Optional Total: ${res.optionalTotal.toFixed(2)}</p>
                  <p>Compulsory Total: ${res.compulsoryTotal.toFixed(2)}</p>
                  <p>Meal Penalties: ${res.sessionRate.toFixed(2)}</p>
                  <p>Head Judge: ${res.meetRate.toFixed(2)}</p>
                  <p>Miles Driven: {res.mileage} @ ${res.mileageRate.toFixed(2)} = ${res.mileageTotal.toFixed(2)}</p>
                  <p className="font-bold text-blue-700 mt-2">Total Pay: ${res.total.toFixed(2)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
