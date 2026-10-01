type TeamRosterNameProps = {
  teamName: string;
  playerNames: string[];
  className?: string;
};

export function TeamRosterName({
  teamName,
  playerNames,
  className = "",
}: TeamRosterNameProps) {
  const tooltip = playerNames.length
    ? `Pelaajat:\n${playerNames.join("\n")}`
    : "Ei pelaajia määritetty";

  return (
    <span
      title={tooltip}
      className={`${className} cursor-help transition-colors hover:text-violet-700`}
    >
      {teamName}
    </span>
  );
}