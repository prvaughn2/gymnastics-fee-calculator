import * as React from "react";

const Card = React.forwardRef(({ className = "", ...props }, ref) => {
  return (
    <div
      className={`rounded-lg border border-border bg-card text-card-foreground shadow-sm ${className}`}
      ref={ref}
      {...props}
    />
  );
});
Card.displayName = "Card";

const CardContent = React.forwardRef(({ className = "", ...props }, ref) => {
  return (
    <div className={`p-6 pt-0 ${className}`} ref={ref} {...props} />
  );
});
CardContent.displayName = "CardContent";

export { Card, CardContent };
