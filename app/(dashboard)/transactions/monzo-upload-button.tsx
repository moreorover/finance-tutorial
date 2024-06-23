import { useCSVReader } from "react-papaparse";
import { Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { insertTransactionSchema, transactionType } from "../../../db/schema";
import { z } from "zod";
import { convertAmountToMiliUnits } from "@/lib/utils";

type Props = {
  onUpload: (results: z.infer<typeof insertTransactionSchema>[]) => void;
};

export const MonzoUploadButton = ({ onUpload }: Props) => {
  const headersExpected = [
    "Transaction ID",
    "Date",
    "Time",
    "Type",
    "Name",
    "Emoji",
    "Category",
    "Amount",
    "Currency",
    "Local amount",
    "Local currency",
    "Notes and #tags",
    "Address",
    "Receipt",
    "Description",
    "Category split",
    "Money Out",
    "Money In",
  ];

  function validateHeader(actualHeaders: string[]) {
    if (headersExpected.length !== actualHeaders.length) {
      console.error(
        `Headers do not match in length. Expected ${headersExpected.length}, but got ${actualHeaders.length}.`,
      );
      return false;
    }

    for (let i = 0; i < headersExpected.length; i++) {
      if (headersExpected[i] !== actualHeaders[i]) {
        console.error(
          `Headers do not match at index ${i}. Expected '${headersExpected[i]}', but got '${actualHeaders[i]}'.`,
        );
        return false;
      }
    }
    return true;
  }

  function validateDateFormat(dateString: string) {
    // Define the regex pattern for dd/MM/yyyy
    const regexPattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;

    // Test if the dateString matches the pattern
    const match = dateString.match(regexPattern);

    if (!match) {
      console.error(
        `Date '${dateString}' does not match the expected format dd/MM/yyyy.`,
      );
      return false;
    }

    // Extract date parts
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    // Check if the day, month, and year are valid
    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      console.error(`Date '${dateString}' is not a valid date.`);
      return false;
    }

    // console.log(
    //   `Date '${dateString}' is valid and matches the format dd/MM/yyyy.`
    // );
    return true;
  }

  function validateTimeFormat(timeString: string) {
    // Define the regex pattern for HH:MM:SS
    const regexPattern = /^(\d{2}):(\d{2}):(\d{2})$/;

    // Test if the timeString matches the pattern
    const match = timeString.match(regexPattern);

    if (!match) {
      console.error(
        `Time '${timeString}' does not match the expected format HH:MM:SS.`,
      );
      return false;
    }

    // Extract time parts
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = parseInt(match[3], 10);

    // Check if the hours, minutes, and seconds are valid
    if (hours < 0 || hours > 23) {
      console.error(
        `Hours '${hours}' are out of range in time '${timeString}'.`,
      );
      return false;
    }

    if (minutes < 0 || minutes > 59) {
      console.error(
        `Minutes '${minutes}' are out of range in time '${timeString}'.`,
      );
      return false;
    }

    if (seconds < 0 || seconds > 59) {
      console.error(
        `Seconds '${seconds}' are out of range in time '${timeString}'.`,
      );
      return false;
    }

    // console.log(
    //   `Time '${timeString}' is valid and matches the format HH:MM:SS.`
    // );
    return true;
  }

  const makeNote = (row: string[]) => {
    row.push(`Name: ${row[4]}\nDescription: ${row[14]}\nNotes: ${row[11]}`);
  };

  function createDateFromStrings(dateString: string, timeString: string) {
    // Split the date string into day, month, year
    const [day, month, year] = dateString.split("/").map(Number);

    // Create an ISO 8601 datetime string
    const isoString = `${year}-${String(month).padStart(2, "0")}-${String(
      day,
    ).padStart(2, "0")}T${timeString}`;

    // Create a Date object from the ISO string
    const dateObject = new Date(isoString);

    return dateObject;
  }

  const verifyData = (results: any) => {
    console.log(results);
    const headers = results.data[0];
    const headersIsValid = validateHeader(headers);
    if (!headersIsValid) {
      return;
    }
    const body: string[][] = results.data.slice(1);

    const filterResult = body.filter(
      (r: string[]) =>
        r[0].startsWith("mm_") &&
        validateDateFormat(r[1]) &&
        validateTimeFormat(r[2]),
    );
    filterResult.forEach((fr) => makeNote(fr));

    console.log({ filterResult });

    const result: z.infer<typeof insertTransactionSchema>[] = [];

    filterResult.forEach((r) => {
      const id = r[0];
      const date = `${r[1]}T${r[2]}`;
      const type = r[3];
      const amount = r[7];
      const currency = r[8];
      const notes = r[18];
      result.push({
        id,
        date: createDateFromStrings(r[1], r[2]),
        type,
        amount: convertAmountToMiliUnits(Number(amount)),
        currency,
        notes,
      });
    });

    // console.log({ result });

    onUpload(result);
  };

  const { CSVReader } = useCSVReader();
  return (
    <CSVReader onUploadAccepted={verifyData}>
      {({ getRootProps }: any) => (
        <Button size="sm" className="w-full lg:w-auto" {...getRootProps()}>
          <Landmark className="mr-2 h-4 w-4" color="#FFA500" />
          Monzo import
        </Button>
      )}
    </CSVReader>
  );
};
