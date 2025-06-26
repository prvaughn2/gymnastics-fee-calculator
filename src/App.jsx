import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, ChevronDown, ChevronUp } from "lucide-react";
import jsPDF from "jspdf";
import logo from "@/assets/53066cfa-1d10-4468-af54-dc55d27eead2.png";
import Papa from "papaparse";

export default function GymnasticsFeeCalculator() {
  const [feeData, setFeeData] = useState([]);
  const [showMeals, setShowMeals] = useState(true);
  const [showExtras, setShowExtras] = useState(true);

  const [judges, setJudges] = useState([
    {
      name: "",
      level: "FIG",
      region: "",
      optionalRoutines: 0,
      compulsoryRoutines: 0,
      sessionRate: 0,
      meetRate: 0,
      mileage: 0,
      mileageRate: 0,
      figFee: 0,
      nationalFee: 0,
      compulsoryFee: 0,
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      breakfastRate: 0,
      lunchRate: 0,
      dinnerRate: 0,
      baggage: 0,
      parking: 0,
      airfare: 0,
      rideshare: 0,
    },
  ]);

  const [results, setResults] = useState([]);

  useEffect(() => {
    fetch("/fees.csv")
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setFeeData(results.data);
          },
        });
      });
  }, []);

  const handleJudgeChange = (index, e) => {
    const { name, value } = e.target;
    const newJudges = [...judges];
    if ([
      "optionalRoutines", "compulsoryRoutines",
      "breakfast", "lunch", "dinner",
      "breakfastRate", "lunchRate", "dinnerRate",
      "meetRate", "mileage", "mileageRate",
      "figFee", "nationalFee", "compulsoryFee",
      "baggage", "parking", "airfare", "rideshare"
    ].includes(name)) {
      newJudges[index][name] = Math.max(0, parseFloat(value) || 0);
    } else {
      newJudges[index][name] = value;
    }

    if (name === "region" && feeData.length > 0) {
      const selectedRegion = value;
      const regionFees = feeData.find(row => row.region === selectedRegion);
      if (regionFees) {
        newJudges[index].figFee = parseFloat(regionFees.figFee);
        newJudges[index].nationalFee = parseFloat(regionFees.nationalFee);
        newJudges[index].compulsoryFee = parseFloat(regionFees.compulsoryFee);
      }
    }

    setJudges(newJudges);
  };

  useEffect(() => {
    const newResults = judges.map((j) => {
      const optional =
        j.level === "FIG" ? j.optionalRoutines * j.figFee :
        j.level === "National" ? j.optionalRoutines * j.nationalFee : 0;
      const compulsory = j.compulsoryRoutines * j.compulsoryFee;
      const meals =
        j.breakfast * j.breakfastRate +
        j.lunch * j.lunchRate +
        j.dinner * j.dinnerRate;
      const mileage = j.mileage * j.mileageRate;
      const extras = j.baggage + j.parking + j.airfare + j.rideshare;
      const total = optional + compulsory + meals + mileage + j.sessionRate + j.meetRate + extras;

      return {
        ...j,
        optionalTotal: optional,
        compulsoryTotal: compulsory,
        mealTotal: meals,
        mileageTotal: mileage,
        extraTotal: extras,
        total,
      };
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
      doc.text(`Judge ${i + 1}: ${res.name} (${res.level}, ${res.region})`, 10, y);
      y += 6;
      if (res.optionalTotal) doc.text(`Optional Total: $${res.optionalTotal.toFixed(2)}`, 10, y), y += 6;
      if (res.compulsoryTotal) doc.text(`Compulsory Total: $${res.compulsoryTotal.toFixed(2)}`, 10, y), y += 6;
      if (res.mealTotal) doc.text(`Meals: $${res.mealTotal.toFixed(2)}`, 10, y), y += 6;
      if (res.mileageTotal) doc.text(`Mileage: $${res.mileageTotal.toFixed(2)}`, 10, y), y += 6;
      if (res.extraTotal) doc.text(`Other Expenses: $${res.extraTotal.toFixed(2)}`, 10, y), y += 6;
      if (res.sessionRate) doc.text(`Meal Reimbursements: $${res.sessionRate.toFixed(2)}`, 10, y), y += 6;
      if (res.meetRate) doc.text(`Head Judge: $${res.meetRate.toFixed(2)}`, 10, y), y += 6;
      doc.text(`Total Pay: $${res.total.toFixed(2)}`, 10, y);
      y += 10;
    });

    doc.save("judging_fees.pdf");
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto text-blue-900">
      <div className="flex justify-center mb-4">
        <img src={logo} alt="NGJA Logo" className="h-16" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-red-600">
        Men's Gymnastics Judge Fee Calculator
      </h1>

      {judges.map((judge, index) => (
        <Card key={index} className="mb-6 border-blue-200 shadow-md">
          <CardContent className="space-y-4">
            <h2 className="text-lg font-semibold text-blue-800">Judge #{index + 1}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div><label>Judge Name</label><Input name="name" value={judge.name} onChange={(e) => handleJudgeChange(index, e)} /></div>
              <div><label>Certification Level</label><select name="level" value={judge.level} onChange={(e) => handleJudgeChange(index, e)} className="border p-2 rounded">
                <option value="FIG">FIG</option>
                <option value="National">National</option>
                <option value="Compulsory">Compulsory</option>
              </select></div>
              <div><label>Region</label><select name="region" value={judge.region} onChange={(e) => handleJudgeChange(index, e)} className="border p-2 rounded">
                <option value="">Select Region</option>
                {[1, 2, 3, 4, 5, 6].map(r => (
                  <option key={r} value={`Region ${r}`}>Region {r}</option>
                ))}</select></div>
              <div><label>Optional Routines</label><Input name="optionalRoutines" value={judge.optionalRoutines} onChange={(e) => handleJudgeChange(index, e)} /></div>
              <div><label>Compulsory Routines</label><Input name="compulsoryRoutines" value={judge.compulsoryRoutines} onChange={(e) => handleJudgeChange(index, e)} /></div>
              <div><label>FIG Optional Fee</label><Input name="figFee" value={judge.figFee} onChange={(e) => handleJudgeChange(index, e)} /></div>
              <div><label>National Optional Fee</label><Input name="nationalFee" value={judge.nationalFee} onChange={(e) => handleJudgeChange(index, e)} /></div>
              <div><label>Compulsory Fee</label><Input name="compulsoryFee" value={judge.compulsoryFee} onChange={(e) => handleJudgeChange(index, e)} /></div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex flex-wrap gap-4 mb-6 justify-center">
        <Button className="bg-red-600 text-white hover:bg-red-700" onClick={() => setJudges([...judges, { ...judges[0] }])}>
          Add Judge
        </Button>
        <Button className="bg-white border text-blue-700 hover:bg-blue-100 flex items-center gap-2" onClick={exportPDF}>
          <Download size={16} /> Export PDF
        </Button>
      </div>

      <div className="mb-6">
        <Card className="mb-4 border-blue-200">
          <CardContent className="space-y-4">
            <h3 className="font-semibold text-blue-800">Meal Reimbursements</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div><label>Breakfast Count</label><Input name="breakfast" /></div>
              <div><label>Breakfast Rate</label><Input name="breakfastRate" /></div>
              <div><label>Lunch Count</label><Input name="lunch" /></div>
              <div><label>Lunch Rate</label><Input name="lunchRate" /></div>
              <div><label>Dinner Count</label><Input name="dinner" /></div>
              <div><label>Dinner Rate</label><Input name="dinnerRate" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4 border-blue-200">
          <CardContent className="space-y-4">
            <h3 className="font-semibold text-blue-800">Other Fees</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div><label>Baggage Fee</label><Input name="baggage" /></div>
              <div><label>Parking Fee</label><Input name="parking" /></div>
              <div><label>Airfare</label><Input name="airfare" /></div>
              <div><label>Rideshare Fee</label><Input name="rideshare" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {results.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-blue-900">Calculated Results</h2>
          <div className="space-y-4">
            {results.map((res, i) => (
              <Card key={i} className="border border-blue-300">
                <CardContent className="py-4 px-6">
                  <h3 className="text-xl font-semibold text-blue-800 mb-2">
                    {res.name} ({res.level}, {res.region})
                  </h3>
                  {res.optionalTotal > 0 && <p>Optional Total: ${res.optionalTotal.toFixed(2)}</p>}
                  {res.compulsoryTotal > 0 && <p>Compulsory Total: ${res.compulsoryTotal.toFixed(2)}</p>}
                  {res.mealTotal > 0 && <p>Meals: ${res.mealTotal.toFixed(2)}</p>}
                  {res.mileageTotal > 0 && <p>Mileage: ${res.mileageTotal.toFixed(2)}</p>}
                  {res.extraTotal > 0 && <p>Other Expenses: ${res.extraTotal.toFixed(2)}</p>}
                  {res.sessionRate > 0 && <p>Meal Reimbursements: ${res.sessionRate.toFixed(2)}</p>}
                  {res.meetRate > 0 && <p>Head Judge: ${res.meetRate.toFixed(2)}</p>}
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
