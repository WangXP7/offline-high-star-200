import RootLayout from "@/layouts/RootLayout";
import PageTitle from "@/components/PageTitle";

const UPDATES = [
  {
    date: "March 30, 2026",
    title: "Queens crown",
    description: "New Queens crown design implemented across the site",
  },
  {
    date: "January 16, 2026",
    title: "Palette Update #2",
    description:
      "Following feedback on yesterday's visual update, we've refined our color palette once more. This new set should provide improved contrast and better readability.",
  },
  {
    date: "January 15, 2026",
    title: "New Color Palette",
    description:
      "We have updated our color palette to provide a unique and distinct visual experience, moving away from pastel tones to a custom design.",
  },
  {
    date: "January 7, 2026",
    title: "Level Library Update",
    description:
      "We have updated our level library to focus exclusively on original, community-contributed content. As part of this transition, previous archival levels have been removed. We are committed to respecting intellectual property rights and providing a unique platform for puzzle enthusiasts.",
  },
];

const Updates = () => {
  return (
    <div className="mt-2 mx-2 sm:mx-8">
      <div className="max-w-[850px] ml-auto mr-auto">
        <div>
          <h1 className="text-4xl mb-6">Key Site Updates</h1>

          {UPDATES.map((update, index) => (
            <div key={index} className={`${index !== 0 ? "mt-9" : "mt-5"}`}>
              <div className="text-xl font-medium border-b border-primary pb-1 mb-3">
                {update.date}
              </div>
              <div>
                <div>
                  <div>
                    <strong className="mb-2">{update.title}</strong>
                    <br />
                    <span>{update.description}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PageUpdates = () => {
  return (
    <RootLayout>
      <PageTitle title="Updates" />
      <Updates />
    </RootLayout>
  );
};

export default PageUpdates;
