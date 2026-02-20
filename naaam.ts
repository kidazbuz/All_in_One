// ... (omitted imports and component metadata for brevity)

// ... (existing form definitions and component class definition)

@Component({
    selector: 'app-products',
    standalone: false,
    templateUrl: './products.html',
    styleUrl: './products.scss',
})
export class Products implements OnInit {

    // ... (existing properties and dependency injections)

    // Placeholder for handleFormError (you might need to implement this)
    // Removed the private declaration here, since it's already implemented below

    // ... (rest of the component properties and methods, including cleanOptionalId)

    // ... (loadInitialData, openModal, handleCreateProductModal, handleEditProductModal, onAddProduct, etc., are unchanged)

    // ----------------------------------------------------------------------
    // --- NEW: Centralized Error Handler for API Responses -----------------
    // ----------------------------------------------------------------------

    /**
     * @private
     * Handles API error responses, specifically HTTP 400 (Bad Request),
     * and maps errors to the corresponding form controls.
     * @param err The error object (usually an HttpErrorResponse).
     * @param form The FormGroup to apply errors to.
     */
    private handleFormError(err: any, form: FormGroup<any>): void {
        this.isLoading.set(false);
        this.message.set(null); // Clear previous generic messages

        if (err.status === 400 && err.error) {
            const errorBody = err.error;
            let generalErrorMessage = 'Submission failed due to validation errors:';
            let specificErrorFound = false;

            // 1. Iterate over keys in the error body (e.g., 'model', 'discounted_price', 'non_field_errors')
            for (const field in errorBody) {
                if (errorBody.hasOwnProperty(field)) {
                    const errorMessages = errorBody[field];
                    const control = form.get(field);

                    // A. Handle specific field errors (like discounted_price or unique model)
                    if (control && Array.isArray(errorMessages)) {
                        // Concatenate all messages for this field
                        const errorMessage = errorMessages.join('; ');

                        // Set the backend error on the control
                        control.setErrors({ apiError: errorMessage });
                        specificErrorFound = true;
                        generalErrorMessage += ` ${field}: ${errorMessage}`;

                    }
                    // B. Handle errors that might come back generically but should target a specific field
                    // Example: "UNIQUE constraint failed: products_productspecification.model"
                    // This often appears in `non_field_errors` or sometimes even on the field itself.
                    else if (field === 'model' && control) {
                        const errorMessage = Array.isArray(errorMessages) ? errorMessages.join('; ') : String(errorMessages);
                         control.setErrors({ apiError: errorMessage });
                         specificErrorFound = true;
                         generalErrorMessage += ` Model: ${errorMessage}`;
                    }

                    // C. Handle non-field errors (e.g., 'non_field_errors' array from Django REST Framework)
                    else if (field === 'non_field_errors' && Array.isArray(errorMessages)) {
                        generalErrorMessage += ` General: ${errorMessages.join('; ')}`;
                        specificErrorFound = true;
                    }
                }
            }

            // If we found specific errors, display a combined message
            if (specificErrorFound) {
                this.message.set('❌ Please correct the errors in the form.');
            } else {
                // Fallback for unexpected 400 errors
                this.message.set('❌ An unexpected validation error occurred. Check console for details.');
                console.error('Unhandled 400 error body:', errorBody);
            }

        } else if (err.status) {
            // Handle other HTTP errors (404, 500, etc.)
            this.message.set(`❌ Server Error (Status: ${err.status}): Failed to process request.`);
            console.error('API Error:', err);
        } else {
            // Handle network errors
            this.message.set('❌ Network Error: Could not connect to the server.');
            console.error('Network Error:', err);
        }
    }


    // ----------------------------------------------------------------------
    // --- STAGE 1: BASE PRODUCT CRUD (Updated to use handleFormError) ------
    // ----------------------------------------------------------------------

    // ... (handleCreateProductModal, handleEditProductModal are unchanged)

    /** Submits the base product form (Create/Update). */
    onAddProduct(): void {
        this.message.set(null);
        this.isLoading.set(true);

        if (this.productForm.invalid) {
            this.productForm.markAllAsTouched();
            this.isLoading.set(false);
            return;
        }

        const rawValue = this.productForm.getRawValue();

        const payload = {
            name: rawValue.name,
            description: rawValue.description,
            // CRITICAL FIX: Ensure category is a number or null, but since it's required it should be a number.
            category: rawValue.category,
            is_active: rawValue.is_active === 'true',
        };

        const url = (this.modalMode === 'edit' && this.currentProductId)
            ? `${this.productUrl}${this.currentProductId}/`
            : this.productUrl;

        const httpMethod = (this.modalMode === 'edit' && this.currentProductId) ?
            this.http.put<Product>(url, payload) :
            this.http.post<Product>(url, payload);

        httpMethod.pipe(
            finalize(() => this.isLoading.set(false))
        ).subscribe({
            next: (response: Product) => {
                this.currentProduct.set(response);
                this.modalService.dismissAll('saved');

                if (this.modalMode === 'create' && response.id) {
                    this.message.set(`Product "${response.name}" created successfully. Now, add specifications (SKUs).`);
                    this.handleCreateSpecModal(response);
                }
                else if (this.modalMode === 'edit') {
                    this.message.set(`Product "${response.name}" updated successfully.`);
                    this.loadInitialData();
                }

            },
            // 🔥 Use the new, robust error handler
            error: err => this.handleFormError(err, this.productForm)
        });
    }

    // ... (handleDeleteProductModal, onDeleteProduct are unchanged)


    // ----------------------------------------------------------------------
    // --- STAGE 2: SPECIFICATION CRUD (Updated to use handleFormError) -----
    // ----------------------------------------------------------------------

    // ... (handleCreateSpecModal, handleEditSpecModal, patchSpecForm are unchanged)

    /** Submits the single specification form (Create/Update) via POST/PUT to the /specs/ endpoint. */
    onAddProductSpec(): void {
      this.message.set(null);
      this.isLoading.set(true);

      const parentId = this.currentSpecProductParentId;

      if (this.specForm.invalid || !parentId) {
          this.specForm.markAllAsTouched();
          this.isLoading.set(false);
          if (!parentId) {
              this.message.set("Missing base product context. Cannot save specification.");
          }
          return;
      }

      // Clear previous API errors before attempting submission
      this.specForm.controls.model.setErrors(null);
      this.specForm.controls.actual_price.setErrors(null);
      this.specForm.controls.discounted_price.setErrors(null);
      // You should add this clearing logic for any field prone to API validation errors

      const rawValue = this.specForm.getRawValue();
      const electricalSpecsGroup = rawValue.electrical_specs;
      let electricalSpecsPayload: ElectricalSpecification | null = null;

      // ... (Payload preparation for electricalSpecsPayload and productConnectivityPayload - UNCHANGED)

      // 1. Prepare ElectricalSpecification Payload
      if (electricalSpecsGroup && (electricalSpecsGroup.voltage || electricalSpecsGroup.wattage)) {
          electricalSpecsPayload = {
              voltage: electricalSpecsGroup.voltage ?? '',
              wattage: electricalSpecsGroup.wattage ?? 0,
              power_supply_type: electricalSpecsGroup.power_supply_type ?? '',
              id: electricalSpecsGroup.id ?? undefined
          };
      }

      // 2. Prepare Product Connectivity Payload
      let productConnectivityPayload: { connectivity: number; connectivity_count: number }[] = [];
      const connectivityArrayRaw = rawValue.product_connectivity_array;

      if (connectivityArrayRaw && connectivityArrayRaw.length > 0) {
          productConnectivityPayload = connectivityArrayRaw
              .filter((item: any) => item && item.connectivity)
              .map((item: any) => {
                  const connectivityId = this.cleanOptionalId(item.connectivity);
                  const count = item.connectivity_count ? parseInt(item.connectivity_count, 10) : NaN;
                  const isValidId = connectivityId !== null && connectivityId > 0;
                  const isValidCount = !isNaN(count) && count > 0;

                  if (isValidId && isValidCount) {
                      return {
                          connectivity: connectivityId,
                          connectivity_count: count,
                      };
                  }
                  return null;
              })
              .filter((item): item is { connectivity: number; connectivity_count: number } => item !== null);
      }


      // 3. Prepare the main ProductSpecification payload
      const payload: any = {
          id: rawValue.id ?? undefined,
          product: parentId,
          model: rawValue.model!,
          color: rawValue.color,
          brand: this.cleanOptionalId(rawValue.brand),
          smart_features: rawValue.smart_features === 'true' || rawValue.smart_features === true,
          screen_size: this.cleanOptionalId(rawValue.screen_size),
          resolution: this.cleanOptionalId(rawValue.resolution),
          panel_type: this.cleanOptionalId(rawValue.panel_type),
          actual_price: String(rawValue.actual_price),
          discounted_price: String(rawValue.discounted_price),
          supported_internet_services: this.selectedInternetServices(),
      };

      // 4. Attach the nested payloads
      if (electricalSpecsPayload && (electricalSpecsPayload.voltage || electricalSpecsPayload.wattage)) {
          payload.electrical_specs = electricalSpecsPayload;
      }

      // 5. Attach Product Connectivity.
      if (productConnectivityPayload.length > 0) {
          payload.product_connectivity = productConnectivityPayload;
      }

      // 6. Determine URL and Method
      const isEdit = this.modalMode === 'edit-spec' && rawValue.id;
      const url = isEdit ? `${this.specUrl}${rawValue.id}/` : this.specUrl;

      const httpMethod = isEdit ?
          this.http.put<ProductSpecification>(url, payload) :
          this.http.post<ProductSpecification>(url, payload);

      httpMethod.pipe(
          finalize(() => this.isLoading.set(false))
      ).subscribe({
          next: (response: ProductSpecification) => {
              this.modalService.dismissAll('saved');
              this.message.set(`✅ Specification "${response.model}" saved successfully.`);
              this.loadInitialData(); // Reload all specs
          },
          // 🔥 Use the new, robust error handler
          error: err => this.handleFormError(err, this.specForm)
      });
    }

    // ... (handleDeleteSpecModal, onDeleteSpec, and rest of component methods are unchanged)
}
