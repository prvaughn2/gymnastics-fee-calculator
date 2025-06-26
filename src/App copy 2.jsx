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
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      meetRate: 0,
      mileage: 0,
      mileageRate: 0,
      figFee: 0,
      nationalFee: 0,
      compulsoryFee: 0,
      baggage: 0,
      parking: 0,
      airfare: 0,
      rideshare: 0,
    },
  ]);

  const [results, setResults] = useState([]);

  const handleJudgeChange = (index, e) => {
    const { name, value } = e.target;
    const newJudges = [...judges];
    if ([
      "optionalRoutines", "compulsoryRoutines",
      "breakfast", "lunch", "dinner",
      "meetRate", "mileage", "mileageRate",
      "figFee", "nationalFee", "compulsoryFee",
      "baggage", "parking", "airfare", "rideshare"
    ].includes(name)) {
      newJudges[index][name] = Math.max(0, parseFloat(value) || 0);
    } else {
      newJudges[index][name] = value;
    }
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
        breakfast: 0,
        lunch: 0,
        dinner: 0,
        meetRate: 0,
        mileage: 0,
        mileageRate: 0,
        figFee: 0,
        nationalFee: 0,
        compulsoryFee: 0,
        baggage: 0,
        parking: 0,
        airfare: 0,
        rideshare: 0,
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
      const mealTotal = judge.breakfast + judge.lunch + judge.dinner;
      const mileageTotal = judge.mileage * judge.mileageRate;
      const fixedFees = judge.baggage + judge.parking + judge.airfare + judge.rideshare;
      const total = compulsoryTotal + optionalTotal + mealTotal + judge.meetRate + mileageTotal + fixedFees;
      return { ...judge, compulsoryTotal, optionalTotal, mealTotal, mileageTotal, fixedFees, total };
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
      doc.text(`Judge ${i + 1}: ${res.name} (${res.level})`, 10, y); y += 6;
      if (res.optionalTotal > 0) doc.text(`Optional Total: $${res.optionalTotal.toFixed(2)}`, 10, y), y += 6;
      if (res.compulsoryTotal > 0) doc.text(`Compulsory Total: $${res.compulsoryTotal.toFixed(2)}`, 10, y), y += 6;
      if (res.breakfast > 0) doc.text(`Breakfast: $${res.breakfast.toFixed(2)}`, 10, y), y += 6;
      if (res.lunch > 0) doc.text(`Lunch: $${res.lunch.toFixed(2)}`, 10, y), y += 6;
      if (res.dinner > 0) doc.text(`Dinner: $${res.dinner.toFixed(2)}`, 10, y), y += 6;
      if (res.meetRate > 0) doc.text(`Head Judge: $${res.meetRate.toFixed(2)}`, 10, y), y += 6;
      if (res.mileageTotal > 0) doc.text(`Miles Driven: ${res.mileage} @ $${res.mileageRate.toFixed(2)} = $${res.mileageTotal.toFixed(2)}`, 10, y), y += 6;
      if (res.baggage > 0) doc.text(`Baggage: $${res.baggage.toFixed(2)}`, 10, y), y += 6;
      if (res.parking > 0) doc.text(`Parking: $${res.parking.toFixed(2)}`, 10, y), y += 6;
      if (res.airfare > 0) doc.text(`Airfare: $${res.airfare.toFixed(2)}`, 10, y), y += 6;
      if (res.rideshare > 0) doc.text(`Rideshare: $${res.rideshare.toFixed(2)}`, 10, y), y += 6;
      doc.text(`Total Pay: $${res.total.toFixed(2)}`, 10, y); y += 10;
    });

    doc.save("judging_fees.pdf");
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto text-blue-900">
      <div className="flex justify-center mb-4">
        <img src={logo} alt="NGJA Logo" className="h-16" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-red-600">Men's Gymnastics Judge Fee Calculator</h1>
      {judges.map((judge, index) => (
        <Card key={index} className="mb-6 border-blue-200 shadow-lg">
          <CardContent className="space-y-6">
            <h2 className="text-lg sm:text-xl font-semibold text-blue-800 border-b pb-2">Judge #{index + 1}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Judge Name</label>
                <Input name="name" value={judge.name} onChange={(e) => handleJudgeChange(index, e)} placeholder="Judge Name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Certification Level</label>
                <select name="level" value={judge.level} onChange={(e) => handleJudgeChange(index, e)} className="border p-2 rounded w-full">
                  <option value="FIG">FIG</option>
                  <option value="National">National</option>
                  <option value="Compulsory">Compulsory</option>
                </select>
              </div>
            </div>

            <h3 className="text-base font-semibold text-blue-700">Routine Counts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Optional Routines</label>
                <Input name="optionalRoutines" type="number" value={judge.optionalRoutines} onChange={(e) => handleJudgeChange(index, e)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Compulsory Routines</label>
                <Input name="compulsoryRoutines" type="number" value={judge.compulsoryRoutines} onChange={(e) => handleJudgeChange(index, e)} />
              </div>
            </div>

            <h3 className="text-base font-semibold text-blue-700">Per Routine Fees</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {judge.level === 'FIG' && (
                <div>
                  <label className="block text-sm font-medium mb-1">FIG Optional Fee</label>
                  <Input name="figFee" type="number" value={judge.figFee} onChange={(e) => handleJudgeChange(index, e)} />
                </div>
              )}
              {judge.level === 'National' && (
                <div>
                  <label className="block text-sm font-medium mb-1">National Optional Fee</label>
                  <Input name="nationalFee" type="number" value={judge.nationalFee} onChange={(e) => handleJudgeChange(index, e)} />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Compulsory Fee</label>
                <Input name="compulsoryFee" type="number" value={judge.compulsoryFee} onChange={(e) => handleJudgeChange(index, e)} />
              </div>
            </div>

            <h3 className="text-base font-semibold text-blue-700">Meal Reimbursements</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Breakfast</label>
                <Input name="breakfast" type="number" value={judge.breakfast} onChange={(e) => handleJudgeChange(index, e)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Lunch</label>
                <Input name="lunch" type="number" value={judge.lunch} onChange={(e) => handleJudgeChange(index, e)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dinner</label>
                <Input name="dinner" type="number" value={judge.dinner} onChange={(e) => handleJudgeChange(index, e)} />
              </div>
            </div>

            <h3 className="text-base font-semibold text-blue-700">Other Flat Rates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Head Judge</label>
                <Input name="meetRate" type="number" value={judge.meetRate} onChange={(e) => handleJudgeChange(index, e)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Miles Driven</label>
                <Input name="mileage" type="number" value={judge.mileage} onChange={(e) => handleJudgeChange(index, e)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mileage Rate</label>
                <Input name="mileageRate" type="number" value={judge.mileageRate} onChange={(e) => handleJudgeChange(index, e)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Baggage</label>
                <Input name="baggage" type="number" value={judge.baggage} onChange={(e) => handleJudgeChange(index, e)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Parking</label>
                <Input name="parking" type="number" value={judge.parking} onChange={(e) => handleJudgeChange(index, e)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Airfare</label>
                <Input name="airfare" type="number" value={judge.airfare} onChange={(e) => handleJudgeChange(index, e)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rideshare</label>
                <Input name="rideshare" type="number" value={judge.rideshare} onChange={(e) => handleJudgeChange(index, e)} />
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
    </div>
  );
}
