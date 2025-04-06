
import LayersList from "../LayersList";

const NoElementSelected = () => {
  return (
    <div className="properties-panel border-l p-6 flex flex-col">
      <h3 className="text-lg font-medium mb-4">Properties</h3>
      <p className="text-sm text-muted-foreground">
        Select an element to edit its properties
      </p>
      
      <LayersList />
    </div>
  );
};

export default NoElementSelected;
